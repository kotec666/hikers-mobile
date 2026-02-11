import { useCallback, useEffect, useRef, useState } from 'react'
import { startTracking, stopTracking } from '@/hooks/track-location/track'
import { CHUNK_POINT_COUNT, getWorkoutChunk, getWorkoutMeta, IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { UserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/UserLocationMarker'
import { locationEmitter } from '@/hooks/track-location/locationEmitter'
import { Point } from 'react-native-yamap-plus'
import { MetricSpeedHandle } from '@/components/training/tabs/metrics/MetricSpeed'
import { useLatest } from '@/hooks/useLatest'
import { AppState, AppStateStatus } from 'react-native'
import { TrainingType } from '@/shared/enums'
import { MetricDistanceHandle } from '@/components/training/tabs/metrics/MetricDistance'
import { MetricCaloriesHandle } from '@/components/training/tabs/metrics/MetricCalories'
import { MetricHeightHandle } from '@/components/training/tabs/metrics/MetricHeight'
import { calculateTotalDistance } from '@/helpers/distance'
import { MapComponentSegmentsHandle } from '@/components/map/MapComponentSegments'
import { MetricAvgSpeedHandle } from '@/components/training/tabs/metrics/MetricAvgSpeed'

export function useLocationTracking() {
	const onStartTracking = useCallback(async () => {
		await startTracking()
	}, [])

	const onStopTracking = useCallback(async () => {
		await stopTracking()
	}, [])

	return {
		startTracking: onStartTracking,
		stopTracking: onStopTracking
	}
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
	// Refs для UI
	const mapComponentRef = useRef<MapComponentSegmentsHandle>(null)
	const userLocationMarkerRef = useRef<UserLocationMarkerHandle>(null)
	const latestUserMarkerLocationRef = useRef<Point>(null)
	const isMountedRef = useRef<boolean>(true)

	// Refs для метрик
	const metricAvgSpeedRef = useRef<MetricAvgSpeedHandle>(null)
	const metricSpeedRef = useRef<MetricSpeedHandle>(null)
	const metricDistanceRef = useRef<MetricDistanceHandle>(null)
	const metricCaloriesRef = useRef<MetricCaloriesHandle>(null)
	const metricHeightRef = useRef<MetricHeightHandle>(null)
	const accumulatedDistanceRef = useRef<number>(0) // Инкрементальная дистанция

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
	const coordsKey = (lat: number, lon: number) => `${lat.toFixed(6)}_${lon.toFixed(6)}`

	const addPointToMap = (p: IWorkoutLocationStorageItem) => {
		const ts = p.locationObject.timestamp
		const key = coordsKey(p.locationObject.coords.latitude, p.locationObject.coords.longitude)

		if (!tsMap.current.has(ts)) {
			tsMap.current.set(ts, new Set())
		}

		const setForTs = tsMap.current.get(ts)!
		if (setForTs.has(key)) return false // дубли
		setForTs.add(key)
		return true
	}

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

	// Вспомогательная функция для расчета дистанции между двумя точками (LocationObject)
	// Можно вынести в helpers, но для наглядности оставим здесь или используем calculateTotalDistance([p1, p2])
	const getDist = useCallback((p1: IWorkoutLocationStorageItem, p2: IWorkoutLocationStorageItem) => {
		return calculateTotalDistance([p1, p2])
	}, [])

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
			const meta = getWorkoutMeta()

			// 1. Скорость
			if (forceUpdate) {
				metricSpeedRef.current?.setSpeed(0)
			} else {
				metricSpeedRef.current?.setSpeed(currentSpeed)
			}

			// 2. Дистанция
			metricDistanceRef.current?.setDistance(accumulatedDistanceRef.current)

			// 3. Калории
			let timeElapsed = 0 // в миллисекундах
			if (meta) {
				if (meta.isPaused && meta.lastPauseAt) {
					timeElapsed = meta.lastPauseAt - meta.startedAt - meta.totalPausedMs
				} else {
					timeElapsed = Date.now() - meta.startedAt - meta.totalPausedMs
				}
			}

			metricCaloriesRef.current?.updateCalories(accumulatedDistanceRef.current, timeElapsed, workoutType)

			// 4. Средняя скорость
			let avgKmh = 0
			if (timeElapsed > 0) {
				avgKmh = (accumulatedDistanceRef.current * 3600) / timeElapsed // distance(m) → km/h
			}

			if (!Number.isFinite(avgKmh) || avgKmh < 0) avgKmh = 0

			metricAvgSpeedRef.current?.setAvgSpeed(avgKmh)

			// 5. Высота
			metricHeightRef.current?.updateHeight(pointsRef.current)
		},
		[workoutType, isPausedRef]
	)

	// Универсальный обработчик для новых точек (push в pointsRef + обновление UI/метрик)
	const processPoints = useCallback(
		(stored: IWorkoutLocationStorageItem[] | null) => {
			if (!stored || stored.length === 0) return
			if (!isMountedRef.current) return

			// Запоминаем последнюю точку ДО добавления новых
			const hasPreviousData = pointsRef.current.length > 0
			const prevLastPoint = hasPreviousData ? pointsRef.current[pointsRef.current.length - 1] : null

			// отфильтруем дубли по timestamp (чтобы избежать наложений истории)

			const incomingFiltered = stored.filter((p) => addPointToMap(p))

			if (incomingFiltered.length === 0) return

			pointsRef.current.push(...incomingFiltered)
			const lastLocation = stored[stored.length - 1]
			if (!lastLocation) return

			const { latitude: lat, longitude: lon, accuracy, speed } = lastLocation.locationObject.coords
			const newLatLon = { lat, lon }

			saveInitialMarkerLocation(newLatLon)
			saveInitialLocations(pointsRef.current)

			// UI updates
			userLocationMarkerRef.current?.setAccuracy(accuracy)
			userLocationMarkerRef.current?.setMarkerPosition(newLatLon)
			latestUserMarkerLocationRef.current = newLatLon
			mapComponentRef.current?.updatePath(pointsRef.current)
			// Центрируем карту
			mapComponentRef.current?.setMapCenter(newLatLon, 1.2)

			// Обновляем метрики
			if (!isPausedRef.current) {
				let batchDistance = 0
				let previousPoint = prevLastPoint

				for (const item of incomingFiltered) {
					if (previousPoint) {
						// Считаем дистанцию только когда обе точки не являются паузой
						if (!previousPoint.paused && !item.paused) {
							batchDistance += getDist(previousPoint, item)
						}
					}
					previousPoint = item
				}

				if (batchDistance > 0) {
					accumulatedDistanceRef.current += batchDistance
				}

				// Обновляем метрики UI
				updateRealtimeMetrics(speed ?? 0)
			}
		},
		[getDist, saveInitialLocations, saveInitialMarkerLocation, updateRealtimeMetrics, isPausedRef]
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
		const meta = getWorkoutMeta()
		if (!meta) return

		isLoadingRef.current = true

		try {
			const totalChunks = meta.chunkCount
			// Сценарий 1: Полная загрузка (при старте приложения)
			if (pointsRef.current.length === 0) {
				// Временный массив для хранения всех точек, чтобы потом правильно посчитать дистанцию
				// (или можно считать на лету, если память критична, но здесь проще так)
				const allLoadedPoints: IWorkoutLocationStorageItem[] = []

				// Грузим чанки. Для правильного порядка лучше грузить с 0 до N
				for (let i = 0; i < totalChunks; i++) {
					if (!isMountedRef.current) break
					const chunk = getWorkoutChunk(i, meta.startedAt)
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

				// пересчитаем дистанцию
				accumulatedDistanceRef.current = calculateTotalDistance(pointsRef.current)

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
					const metaNow = getWorkoutMeta()
					setIsPaused(metaNow?.isPaused ?? false)
					setIsWorkoutStarted(true)
					initialDataLoadedSetRef.current = true
				} else if (pointsRef.current.length > 0 && isMountedRef.current) {
					// Fallback: если вью уже была запущена (крайний случай)
					mapComponentRef.current?.updatePath(pointsRef.current)
					const last = pointsRef.current[pointsRef.current.length - 1]
					const { latitude, longitude } = last.locationObject.coords
					const pos = { lat: latitude, lon: longitude }
					userLocationMarkerRef.current?.setMarkerPosition(pos)
					latestUserMarkerLocationRef.current = pos
					mapComponentRef.current?.setMapCenter(pos, 0)
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
					const chunk = getWorkoutChunk(i, meta.startedAt)

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
					let gapDistance = 0

					// 1. Дистанция от старой последней до первой новой
					if (
						lastKnownPoint &&
						lastKnownPoint.locationObject.timestamp !== newPoints[0].locationObject.timestamp
					) {
						gapDistance += getDist(lastKnownPoint, newPoints[0])
					}

					// 2. Дистанция внутри новых точек (если их > 1)
					// Используем имеющийся helper, передавая массив LocationObject
					if (newPoints.length > 1) {
						gapDistance += calculateTotalDistance(newPoints)
					}
					accumulatedDistanceRef.current += gapDistance
					pointsRef.current.push(...newPoints)

					// Обновляем карту и метрики
					mapComponentRef.current?.updatePath(pointsRef.current)

					const lastNewPoint = newPoints[newPoints.length - 1]
					const { latitude, longitude, speed, accuracy } = lastNewPoint.locationObject.coords
					const pos = { lat: latitude, lon: longitude }

					userLocationMarkerRef.current?.setAccuracy(accuracy)
					userLocationMarkerRef.current?.setMarkerPosition(pos)
					latestUserMarkerLocationRef.current = pos

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
	}, [saveInitialMarkerLocation, saveInitialLocations, updateRealtimeMetrics, getDist, processPoints])

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
		mapComponentRef.current?.updatePath([])

		// 4. Сброс метрик
		metricSpeedRef.current?.setSpeed(0)
		metricAvgSpeedRef.current?.setAvgSpeed(0)
		metricDistanceRef.current?.setDistance(0)
		metricCaloriesRef.current?.updateCalories(0, 0, workoutType)
		metricHeightRef.current?.updateHeight([])
	}, [workoutType])

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

		const meta = getWorkoutMeta()
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
				const meta = getWorkoutMeta()
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
	}, [loadHistoryProgressively])

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
		mapComponentRef,
		userLocationMarkerRef,
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

// @TODO Переместить в хранилище расчет дистанции или сделать хуком?
// /**
//  * A hook to calculate the distance, in meters, between the registered locations.
//  */
// export function useLocationDistance(locations: LocationObject[], precision = 2) {
// 	// Let's memoize this method to avoid costly calculations
// 	return useMemo(() => {
// 		const distance = getDistanceFromLocations(locations)
// 		const factor = Math.pow(10, precision)
// 		const rounded = Math.round(distance * factor) / factor
//
// 		return Number.isNaN(rounded) ? 0 : rounded
// 	}, [locations, precision])
// }
