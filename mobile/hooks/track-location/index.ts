import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { startTracking, stopTracking } from '@/hooks/track-location/track'
import {
	CHUNK_POINT_COUNT,
	getWorkoutChunk,
	getWorkoutDistanceMeters,
	getWorkoutMeta,
	IWorkoutLocationStorageItem
} from '@/store/workoutStorage'
import { locationEmitter } from '@/hooks/track-location/locationEmitter'
import { Point } from 'react-native-yamap-plus'
import { MetricSpeedHandle } from '@/components/training/tabs/metrics/MetricSpeed'
import { useLatest } from '@/hooks/useLatest'
import { AppState, AppStateStatus, Platform } from 'react-native'
import { TrainingType } from '@/shared/enums'
import { MetricDistanceHandle } from '@/components/training/tabs/metrics/MetricDistance'
import { MetricCaloriesHandle } from '@/components/training/tabs/metrics/MetricCalories'
import { MetricHeightHandle } from '@/components/training/tabs/metrics/MetricHeight'
import { MetricAvgSpeedHandle } from '@/components/training/tabs/metrics/MetricAvgSpeed'
import { useAuthStore } from '@/store/authStore'
import { calculateAverageSpeedKmh, getWorkoutElapsedMs } from '@/helpers/workoutMetrics'
import { YaMapWorkoutHandle } from '@/components/map/YaMapWorkout'
import { YaMapUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'
import { RNMapAnimationType, RNMapWorkoutHandle } from '@/components/map/RNMapWorkout'
import { RNMapsUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'

export function useLocationTracking() {
	const onStartTracking = useCallback(async () => {
		await startTracking()
	}, [])

	const onStopTracking = useCallback(async () => {
		await stopTracking()
	}, [])

	return useMemo(
		() => ({
			startTracking: onStartTracking,
			stopTracking: onStopTracking
		}),
		[onStartTracking, onStopTracking]
	)
}

const YAMAP_POLYLINE_MINIMUM_POINTS = 2

/**
 * Хук для опроса изменений в хранилище, обновляет интерфейс, если были добавлены местоположения.
 */
export function useLocationData(
	resolver: (() => void) | null,
	onInitialDataLoadedCallback: (restoredWorkoutType: TrainingType) => void,
	workoutType: TrainingType
) {
	const { user } = useAuthStore()
	// Platform
	const isIOS = Platform.OS === 'ios'

	// Refs для UI
	const yaMapComponentRef = useRef<YaMapWorkoutHandle>(null)
	const yaMapUserLocationMarkerRef = useRef<YaMapUserLocationMarkerHandle>(null)
	const rnMapComponentRef = useRef<RNMapWorkoutHandle>(null)
	const rnMapUserLocationMarkerRef = useRef<RNMapsUserLocationMarkerHandle>(null)
	const latestUserMarkerLocationRef = useRef<Point>(null)
	const isMountedRef = useRef<boolean>(true)

	// Refs для метрик
	const metricAvgSpeedRef = useRef<MetricAvgSpeedHandle>(null)
	const metricSpeedRef = useRef<MetricSpeedHandle>(null)
	const metricDistanceRef = useRef<MetricDistanceHandle>(null)
	const metricCaloriesRef = useRef<MetricCaloriesHandle>(null)
	const metricHeightRef = useRef<MetricHeightHandle>(null)
	const accumulatedDistanceRef = useRef<number>(0) // UI cache; source of truth is workout meta.

	const pointsRef = useRef<IWorkoutLocationStorageItem[]>([])

	// стейты / refs для initial display
	const initialMarkerLocationSetRef = useRef(false)
	const initialLocationsSetRef = useRef(false)
	const initialDataLoadedSetRef = useRef(false)

	const [isWorkoutStarted, setIsWorkoutStarted] = useState<boolean>(false)
	const [isPaused, setIsPaused] = useState<boolean>(false)
	const [initialMarkerLocationState, setInitialMarkerLocationState] = useState<Point | null>(null)
	const [initialLocationsState, setInitialLocationsState] = useState<IWorkoutLocationStorageItem[]>([])

	const isPausedRef = useLatest(isPaused)

	// защита загрузки истории / потоковой обработки
	const isLoadingRef = useRef(false) // для асинхронных loadHistoryProgressively вызовов
	const isHistoryLoading = useRef(false) // когда именно идет история (очередь в это время копим)
	const queueDuringLoad = useRef<IWorkoutLocationStorageItem[]>([]) // live точки, пришедшие во время загрузки
	const acceptLivePointsRef = useRef<boolean>(true) // включена обработка live точек (AppState проверяет)

	const tsMap = useRef<Map<number, Set<string>>>(new Map())

	// app state
	const appStateRef = useRef(AppState.currentState)

	// Функция генерации ключа координат
	const coordsKey = useCallback((lat: number, lon: number) => `${lat.toFixed(6)}_${lon.toFixed(6)}`, [])

	const addPointToMap = useCallback(
		(p: IWorkoutLocationStorageItem) => {
			const ts = p.locationObject.timestamp
			const key = coordsKey(p.locationObject.coords.latitude, p.locationObject.coords.longitude)

			if (!tsMap.current.has(ts)) {
				tsMap.current.set(ts, new Set())
			}

			const setForTs = tsMap.current.get(ts)!
			if (setForTs.has(key)) return false // дубли
			setForTs.add(key)
			return true
		},
		[coordsKey]
	)

	const ensureMinPolylinePoints = useCallback(
		(locations: IWorkoutLocationStorageItem[]): IWorkoutLocationStorageItem[] => {
			if (locations.length >= YAMAP_POLYLINE_MINIMUM_POINTS) return locations
			if (locations.length === 1) return [locations[0], locations[0]]
			return []
		},
		[]
	)

	// Добавили флаг force, чтобы при загрузке истории мы могли принудительно обновить позицию маркера,
	// даже если до этого была установлена "быстрая" GPS позиция.
	const saveInitialLocations = useCallback(
		(
			initialLocations: IWorkoutLocationStorageItem[] | IWorkoutLocationStorageItem | null,
			force: boolean = false
		) => {
			if ((initialLocationsSetRef.current && !force) || !isMountedRef.current) return

			let result: IWorkoutLocationStorageItem[] = []

			if (Array.isArray(initialLocations) && initialLocations.length > 0) {
				result = initialLocations
			} else if (initialLocations && !Array.isArray(initialLocations)) {
				result = [initialLocations]
			}

			// Создаём минимум 2 точки для Polyline
			result = ensureMinPolylinePoints(result)

			if (result.length >= YAMAP_POLYLINE_MINIMUM_POINTS) initialLocationsSetRef.current = true

			setInitialLocationsState(result)
		},
		[ensureMinPolylinePoints]
	)

	// Добавили флаг force, чтобы при загрузке истории мы могли принудительно обновить позицию маркера,
	// даже если до этого была установлена "быстрая" GPS позиция.
	const saveInitialMarkerLocation = useCallback((newLatLon: { lat: number; lon: number }, force: boolean = false) => {
		if ((!initialMarkerLocationSetRef.current || force) && isMountedRef.current) {
			initialMarkerLocationSetRef.current = true
			setInitialMarkerLocationState(newLatLon)
		}
	}, [])

	const syncAccumulatedDistanceFromStorage = useCallback(() => {
		const distanceMeters = getWorkoutDistanceMeters(user?.id)
		accumulatedDistanceRef.current = distanceMeters

		return distanceMeters
	}, [user?.id])

	/**
	 * Основная функция обновления метрик при получении новой точки
	 * @param currentSpeed - текущая скорость
	 * @param forceUpdate - принудительное обновление (нужно для восстановления состояния при паузе)
	 */
	const updateRealtimeMetrics = useCallback(
		(currentSpeed: number, forceUpdate: boolean = false) => {
			if (!isMountedRef.current) return
			// Если пауза и это не принудительное обновление — выходим
			if (isPausedRef.current && !forceUpdate) return
			const meta = getWorkoutMeta(user?.id)
			const distanceMeters = syncAccumulatedDistanceFromStorage()

			// 1. Скорость
			if (forceUpdate) {
				metricSpeedRef.current?.setSpeed(0)
			} else {
				metricSpeedRef.current?.setSpeed(currentSpeed)
			}

			// 2. Дистанция
			metricDistanceRef.current?.setDistance(distanceMeters)

			// 3. Калории
			const timeElapsed = meta ? getWorkoutElapsedMs(meta) : 0

			metricCaloriesRef.current?.updateCalories(distanceMeters, timeElapsed, workoutType)

			// 4. Средняя скорость
			const avgKmh = calculateAverageSpeedKmh(distanceMeters, timeElapsed)

			metricAvgSpeedRef.current?.setAvgSpeed(avgKmh)

			// 5. Высота
			metricHeightRef.current?.updateHeight(pointsRef.current)
		},
		[user?.id, workoutType, isPausedRef, syncAccumulatedDistanceFromStorage]
	)

	// Универсальный обработчик для новых точек (push в pointsRef + обновление UI/метрик)
	const processPoints = useCallback(
		(stored: IWorkoutLocationStorageItem[] | null) => {
			if (!stored || stored.length === 0) return
			if (!isMountedRef.current) return

			// отфильтруем дубли по timestamp (чтобы избежать наложений истории)

			const incomingFiltered = stored.filter((p) => addPointToMap(p))

			if (incomingFiltered.length === 0) return

			pointsRef.current.push(...incomingFiltered)
			const lastLocation = stored[stored.length - 1]
			if (!lastLocation) return

			const { latitude: lat, longitude: lon, accuracy, speed } = lastLocation.locationObject.coords
			const markerMoveOptions = { speedMps: speed, timestamp: lastLocation.locationObject.timestamp }
			const newLatLon = { lat, lon }

			saveInitialMarkerLocation(newLatLon)
			saveInitialLocations(pointsRef.current)

			// UI updates
			let markerMoveDurationMs: number | null | undefined
			if (isIOS) {
				rnMapUserLocationMarkerRef.current?.setAccuracy(accuracy)
				markerMoveDurationMs = rnMapUserLocationMarkerRef.current?.setMarkerPosition(
					newLatLon,
					markerMoveOptions
				)
			} else {
				yaMapUserLocationMarkerRef.current?.setAccuracy(accuracy)
				markerMoveDurationMs = yaMapUserLocationMarkerRef.current?.setMarkerPosition(
					newLatLon,
					markerMoveOptions
				)
			}
			latestUserMarkerLocationRef.current = newLatLon
			if (isIOS) {
				rnMapComponentRef.current?.updatePath(pointsRef.current)
			} else {
				yaMapComponentRef.current?.updatePath(pointsRef.current)
			}
			// Центрируем карту
			if (markerMoveDurationMs === null) return

			if (isIOS) {
				rnMapComponentRef.current?.setMapCenter({ center: newLatLon, durationMs: markerMoveDurationMs })
			} else {
				yaMapComponentRef.current?.setMapCenter(
					newLatLon,
					markerMoveDurationMs ? markerMoveDurationMs / 1000 : undefined
				)
			}

			// Обновляем метрики
			if (!isPausedRef.current) {
				// Обновляем метрики UI
				updateRealtimeMetrics(speed ?? 0)
			}
		},
		[addPointToMap, saveInitialLocations, saveInitialMarkerLocation, updateRealtimeMetrics, isPausedRef, isIOS]
	)

	// Callback, который подписка locationEmitter будет вызывать.
	// Он либо кладёт точки в очередь (если идет история), либо сразу обрабатывает.
	const onLocations = useCallback(
		(stored: IWorkoutLocationStorageItem[] | null) => {
			if (!stored || stored.length === 0) return
			if (appStateRef.current !== 'active') return

			// Если сейчас загружаем историю — накапливаем в очередь
			if (isHistoryLoading.current) {
				// просто кладем в очередь без изменения tsMap
				queueDuringLoad.current.push(...stored)
				return
			}

			// Если обработка live отключена (app in background) — игнорируем
			if (!acceptLivePointsRef.current) return

			// Иначе — обрабатываем напрямую
			processPoints(stored)
		},
		[processPoints]
	)

	// Функция прогрессивной загрузки истории (с защитой от параллельных вызовов)
	const loadHistoryProgressively = useCallback(async () => {
		if (isLoadingRef.current) return
		const meta = getWorkoutMeta(user?.id)
		if (!meta) return

		isLoadingRef.current = true

		try {
			const totalChunks = meta.chunkCount
			// Сценарий 1: Полная загрузка (при старте приложения)
			if (pointsRef.current.length === 0) {
				// Временный массив для восстановления карты; дистанция хранится инкрементально в meta.
				const allLoadedPoints: IWorkoutLocationStorageItem[] = []

				// Грузим чанки. Для правильного порядка лучше грузить с 0 до N
				for (let i = 0; i < totalChunks; i++) {
					if (!isMountedRef.current) break
					const chunk = getWorkoutChunk(i, meta.startedAt, user?.id)
					if (chunk.length > 0) allLoadedPoints.push(...chunk)
					// Даем UI дышать
					if (i % 2 === 0) await new Promise((r) => setTimeout(r, 0))
				}

				if (!isMountedRef.current) return
				// Сохраняем уникальные точки истории в pointsRef
				pointsRef.current = []
				allLoadedPoints.forEach((p) => {
					if (addPointToMap(p)) {
						pointsRef.current.push(p)
					}
				})

				syncAccumulatedDistanceFromStorage()

				if (pointsRef.current.length > 0) {
					const last = pointsRef.current[pointsRef.current.length - 1]
					const { latitude, longitude, speed } = last.locationObject.coords
					const pos = { lat: latitude, lon: longitude }

					// Принудительно обновляем начальную позицию из истории, чтобы перетереть FastGPS позицию
					saveInitialMarkerLocation(pos, true)
					// Принудительно обновляем начальные локации для корректного отображения StartLocationMarker
					saveInitialLocations(pointsRef.current, true)
					// Init metrics
					updateRealtimeMetrics(speed ?? 0)
				}

				// Запускаем UI только после того, как данные загружены и стейты обновлены.
				// Это гарантирует, что WorkoutStarted смонтируется с правильными initialMarkerLocation и initialLocations
				if (!initialDataLoadedSetRef.current && isMountedRef.current) {
					const metaNow = getWorkoutMeta(user?.id)
					setIsPaused(metaNow?.isPaused ?? false)
					setIsWorkoutStarted(true)
					initialDataLoadedSetRef.current = true
				} else if (pointsRef.current.length > 0 && isMountedRef.current) {
					// Fallback: если вью уже была запущена (крайний случай)
					if (isIOS) {
						rnMapComponentRef.current?.updatePath(pointsRef.current)
					} else {
						yaMapComponentRef.current?.updatePath(pointsRef.current)
					}
					const last = pointsRef.current[pointsRef.current.length - 1]
					const { latitude, longitude } = last.locationObject.coords
					const markerMoveOptions = { immediate: true, timestamp: last.locationObject.timestamp }
					const pos = { lat: latitude, lon: longitude }
					if (isIOS) {
						rnMapUserLocationMarkerRef.current?.setMarkerPosition(pos, markerMoveOptions)
					} else {
						yaMapUserLocationMarkerRef.current?.setMarkerPosition(pos, markerMoveOptions)
					}
					latestUserMarkerLocationRef.current = pos
					if (isIOS) {
						rnMapComponentRef.current?.setMapCenter({
							center: pos,
							animationType: RNMapAnimationType.LINEAR
						})
					} else {
						yaMapComponentRef.current?.setMapCenter(pos, 0)
					}
				}
			}
			// Сценарий 2: Догрузка после background (упрощенно)
			else {
				const lastKnownPoint = pointsRef.current[pointsRef.current.length - 1]
				const lastKnownRelTs = lastKnownPoint?.relTs ?? -1
				const newPoints: IWorkoutLocationStorageItem[] = []

				// оптимизация: стартуем с чанка, где примерно конец
				const startChunkIdx = Math.max(0, Math.floor(pointsRef.current.length / CHUNK_POINT_COUNT))

				for (let i = startChunkIdx; i < totalChunks; i++) {
					if (!isMountedRef.current) break
					const chunk = getWorkoutChunk(i, meta.startedAt, user?.id)

					chunk.forEach((p) => {
						if (
							p.relTs > lastKnownRelTs &&
							p.relTs >= 0 &&
							p.relTs <= 2000000000 && // фильтруем испорченные relTs
							addPointToMap(p) // проверка дублей через tsMap
						) {
							newPoints.push(p)
						}
					})
				}

				if (newPoints.length > 0 && isMountedRef.current) {
					syncAccumulatedDistanceFromStorage()
					pointsRef.current.push(...newPoints)

					// Обновляем карту и метрики
					if (isIOS) {
						rnMapComponentRef.current?.updatePath(pointsRef.current)
					} else {
						yaMapComponentRef.current?.updatePath(pointsRef.current)
					}

					const lastNewPoint = newPoints[newPoints.length - 1]
					const { latitude, longitude, speed, accuracy } = lastNewPoint.locationObject.coords
					const markerMoveOptions = { speedMps: speed, timestamp: lastNewPoint.locationObject.timestamp }
					const pos = { lat: latitude, lon: longitude }

					let markerMoveDurationMs: number | null | undefined
					if (isIOS) {
						rnMapUserLocationMarkerRef.current?.setAccuracy(accuracy)
						markerMoveDurationMs = rnMapUserLocationMarkerRef.current?.setMarkerPosition(
							pos,
							markerMoveOptions
						)
					} else {
						yaMapUserLocationMarkerRef.current?.setAccuracy(accuracy)
						markerMoveDurationMs = yaMapUserLocationMarkerRef.current?.setMarkerPosition(
							pos,
							markerMoveOptions
						)
					}
					latestUserMarkerLocationRef.current = pos
					if (markerMoveDurationMs === null) return

					if (isIOS) {
						rnMapComponentRef.current?.setMapCenter({ center: pos, durationMs: markerMoveDurationMs })
					} else {
						yaMapComponentRef.current?.setMapCenter(
							pos,
							markerMoveDurationMs ? markerMoveDurationMs / 1000 : undefined
						)
					}

					updateRealtimeMetrics(speed ?? 0)
				}
			}

			// После основной работы: если во время загрузки накопились дополнительные точки в queue — обработаем их
			if (queueDuringLoad.current.length > 0 && isMountedRef.current) {
				const queuedNow = queueDuringLoad.current.filter((p) => addPointToMap(p))
				queueDuringLoad.current = []
				processPoints(queuedNow)
			}
		} finally {
			isHistoryLoading.current = false
			isLoadingRef.current = false
		}
	}, [
		user?.id,
		saveInitialMarkerLocation,
		saveInitialLocations,
		updateRealtimeMetrics,
		syncAccumulatedDistanceFromStorage,
		processPoints,
		addPointToMap,
		isIOS
	])

	/**
	 * Функция для полного сброса состояния тренировки и очистки карты.
	 * Вызывается при завершении тренировки.
	 */
	const resetWorkoutState = useCallback(() => {
		if (!isMountedRef.current) return

		// 1. Сброс refs
		pointsRef.current = []
		accumulatedDistanceRef.current = 0
		initialMarkerLocationSetRef.current = false
		initialLocationsSetRef.current = false
		initialDataLoadedSetRef.current = false
		isHistoryLoading.current = false
		isLoadingRef.current = false
		queueDuringLoad.current = []
		tsMap.current.clear()

		// 2. Сброс React State
		setInitialLocationsState([])
		setInitialMarkerLocationState(null)
		setIsWorkoutStarted(false)
		setIsPaused(false)

		// 3. Очистка карты (важно для удаления полилайна)
		if (isIOS) {
			rnMapComponentRef.current?.updatePath([])
		} else {
			yaMapComponentRef.current?.updatePath([])
		}

		// 4. Сброс метрик
		metricSpeedRef.current?.setSpeed(0)
		metricAvgSpeedRef.current?.setAvgSpeed(0)
		metricDistanceRef.current?.setDistance(0)
		metricCaloriesRef.current?.updateCalories(0, 0, workoutType)
		metricHeightRef.current?.updateHeight([])
	}, [workoutType, isIOS])

	// Эффект — при монтировании: resolver + начальная загрузка истории (один раз)
	useEffect(() => {
		isMountedRef.current = true
		if (resolver) resolver()

		let mounted = true
		const init = async () => {
			// сначала применить пустые/текущие initials
			saveInitialLocations(pointsRef.current)
			// загружаем историю (защищённо)
			isHistoryLoading.current = true
			await loadHistoryProgressively()
			// после загрузки — если в активном состоянии, принять live точки
			if (mounted && appStateRef.current === 'active') {
				acceptLivePointsRef.current = true
			}
		}

		const meta = getWorkoutMeta(user?.id)
		if (meta) {
			onInitialDataLoadedCallback(meta.type)
			init()
		}

		return () => {
			mounted = false
			isMountedRef.current = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []) // один раз

	// Подписка на emitter — только ОДНА подписка, не зависит от loadHistoryProgressively
	useEffect(() => {
		// Подписываемся один раз на весь lifecycle
		const unsub = locationEmitter.subscribe(onLocations)
		return () => {
			unsub()
		}
	}, [onLocations])

	// AppState listener — переключаем флаг acceptLivePointsRef и по возвращении вызываем загрузку истории
	useEffect(() => {
		const onAppStateChange = async (nextAppState: AppStateStatus) => {
			const prev = appStateRef.current
			appStateRef.current = nextAppState

			// При возврате в active — включаем обработку live и догружаем историю
			if (prev.match(/inactive|background/) && nextAppState === 'active') {
				const meta = getWorkoutMeta(user?.id)
				if (meta && isMountedRef.current) {
					setIsPaused(meta.isPaused)
					acceptLivePointsRef.current = false // блокируем live точки
					isHistoryLoading.current = true
					await loadHistoryProgressively()
					acceptLivePointsRef.current = true // включаем только после полной догрузки
				}
			}

			// При уходе в background — временно отключаем обработку live (чтобы не тратить cpu)
			if (prev === 'active' && nextAppState.match(/inactive|background/)) {
				acceptLivePointsRef.current = false
			}
		}

		const sub = AppState.addEventListener('change', onAppStateChange)
		return () => sub.remove()
	}, [user?.id, loadHistoryProgressively])

	// Эффект для принудительного обновления метрик после монтирования компонентов тренировки
	// Это решает проблему пустых метрик при перезапуске приложения в состоянии "Пауза"
	useEffect(() => {
		if (
			isWorkoutStarted &&
			pointsRef.current.length > 0 &&
			isMountedRef.current &&
			initialDataLoadedSetRef.current
		) {
			const timer = setTimeout(() => {
				if (!isMountedRef.current) return
				const lastPoint = pointsRef.current[pointsRef.current.length - 1]
				const speed = lastPoint.locationObject.coords.speed ?? 0
				updateRealtimeMetrics(speed, true)
			}, 300)
			return () => clearTimeout(timer)
		}
	}, [isWorkoutStarted, updateRealtimeMetrics])

	return {
		rnMapComponentRef,
		rnMapUserLocationMarkerRef,
		yaMapComponentRef,
		yaMapUserLocationMarkerRef,
		latestUserMarkerLocationRef,
		metricAvgSpeedRef,
		metricSpeedRef,
		metricDistanceRef,
		metricCaloriesRef,
		metricHeightRef,
		accumulatedDistanceRef,
		pointsRef,
		acceptLivePointsRef,
		initialMarkerLocationState,
		initialLocationsState,
		isWorkoutStarted,
		isPaused,
		resetWorkoutState,
		saveInitialMarkerLocation,
		setInitialMarkerLocationState,
		setIsPaused,
		setIsWorkoutStarted
	}
}
