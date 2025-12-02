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
	const mapComponentRef = useRef<MapComponentSegmentsHandle>(null)
	const userLocationMarkerRef = useRef<UserLocationMarkerHandle>(null)
	const isMountedRef = useRef<boolean>(true)

	// Refs для метрик
	const metricSpeedRef = useRef<MetricSpeedHandle>(null)
	const metricDistanceRef = useRef<MetricDistanceHandle>(null)
	const metricCaloriesRef = useRef<MetricCaloriesHandle>(null)
	const metricHeightRef = useRef<MetricHeightHandle>(null)

	const pointsRef = useRef<IWorkoutLocationStorageItem[]>([])
	const initialMarkerLocationSetRef = useRef(false)
	const initialLocationsSetRef = useRef(false)
	const initialDataLoadedSetRef = useRef(false)

	const appStateRef = useRef(AppState.currentState)
	const accumulatedDistanceRef = useRef<number>(0) // Инкрементальная дистанция

	const [isWorkoutStarted, setIsWorkoutStarted] = useState<boolean>(false)
	const [isPaused, setIsPaused] = useState<boolean>(false)
	const [initialMarkerLocationState, setInitialMarkerLocationState] = useState<Point | null>(null)
	const [initialLocationsState, setInitialLocationsState] = useState<IWorkoutLocationStorageItem[]>([])
	const isPausedRef = useLatest(isPaused)
	const isLoadingRef = useRef(false)

	const ensureMinPolylinePoints = useCallback(
		(locations: IWorkoutLocationStorageItem[]): IWorkoutLocationStorageItem[] => {
			if (locations.length >= YAMAP_POLYLINE_MINIMUM_POINTS) return locations
			if (locations.length === 1) return [locations[0], locations[0]]
			// если нет точек — создаём "заглушку"
			return []
			// return [initialLocationForPolyline, initialLocationForPolyline]
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

			console.log('saveInitialLocations update')
			setInitialLocationsState(result)
		},
		[ensureMinPolylinePoints]
	)

	// Добавили флаг force, чтобы при загрузке истории мы могли принудительно обновить позицию маркера,
	// даже если до этого была установлена "быстрая" GPS позиция.
	const saveInitialMarkerLocation = useCallback((newLatLon: { lat: number; lon: number }, force: boolean = false) => {
		if ((!initialMarkerLocationSetRef.current || force) && isMountedRef.current) {
			initialMarkerLocationSetRef.current = true
			console.log('saveInitialMarkerLocation update')
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
			// Если пауза и это не принудительное обновление (восстановление), то выходим
			if (isPausedRef.current && !forceUpdate) return
			// 1. Скорость
			if (forceUpdate) {
				metricSpeedRef.current?.setSpeed(0)
			} else {
				metricSpeedRef.current?.setSpeed(currentSpeed)
			}
			// 2. Дистанция
			metricDistanceRef.current?.setDistance(accumulatedDistanceRef.current)
			// 3. Калории
			const meta = getWorkoutMeta()

			let timeElapsed = 0
			if (meta) {
				if (meta.isPaused && meta.lastPauseAt) {
					timeElapsed = meta.lastPauseAt - meta.startedAt - meta.totalPausedMs
				} else {
					timeElapsed = Date.now() - meta.startedAt - meta.totalPausedMs
				}
			}

			metricCaloriesRef.current?.setCalories(accumulatedDistanceRef.current, timeElapsed, workoutType)

			// 4. Высота
			metricHeightRef.current?.updateHeight(pointsRef.current)
		},
		[workoutType, isPausedRef]
	)

	const onLocations = useCallback(
		(stored: IWorkoutLocationStorageItem[] | null) => {
			if (!stored || stored.length === 0) return

			// Запоминаем последнюю точку ДО добавления новых
			const hasPreviousData = pointsRef.current.length > 0
			const prevLastPoint = hasPreviousData ? pointsRef.current[pointsRef.current.length - 1] : null

			pointsRef.current.push(...stored)
			const lastLocation = stored[stored.length - 1]

			if (lastLocation) {
				const { latitude: lat, longitude: lon, accuracy, speed } = lastLocation.locationObject.coords
				const newLatLon = { lat, lon }

				saveInitialMarkerLocation(newLatLon)
				saveInitialLocations(pointsRef.current)

				userLocationMarkerRef.current?.setAccuracy(accuracy)
				userLocationMarkerRef.current?.setMarkerPosition(newLatLon)

				// Центрируем карту
				mapComponentRef.current?.setMapCenter(newLatLon, 1.2)
				// Рисуем путь
				mapComponentRef.current?.updatePath(pointsRef.current)

				// Обновляем метрики
				if (!isPausedRef.current) {
					let batchDistance = 0
					let previousPoint = prevLastPoint

					for (const item of stored) {
						if (previousPoint) {
							// [FIX] Баг "телепортации": дистанция считается только если оба сегмента активны (не на паузе).
							// Если previousPoint был поставлен во время паузы, то прямая линия до item не должна идти в зачет.
							// item.isPausedPoint тоже проверяем, так как дистанция во время паузы не считается.
							if (!previousPoint.isPausedPoint && !item.isPausedPoint) {
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
			}
		},
		[saveInitialLocations, saveInitialMarkerLocation, updateRealtimeMetrics, getDist, isPausedRef]
	)

	// Функция постепенной загрузки истории
	const loadHistoryProgressively = useCallback(async () => {
		if (isLoadingRef.current) return
		console.log('loadHistoryProgressively')
		const meta = getWorkoutMeta()
		if (!meta) return

		isLoadingRef.current = true
		const totalChunks = meta.chunkCount

		// Сценарий 1: Полная загрузка (при старте приложения)
		if (pointsRef.current.length === 0) {
			let totalDist = 0
			// Временный массив для хранения всех точек, чтобы потом правильно посчитать дистанцию
			// (или можно считать на лету, если память критична, но здесь проще так)
			const allLoadedPoints: IWorkoutLocationStorageItem[] = []

			// Грузим чанки. Для правильного порядка лучше грузить с 0 до N
			for (let i = 0; i < totalChunks; i++) {
				if (!isMountedRef.current) return // Exit if unmounted
				console.log(`loadHistoryProgressively idx: ${i}`)
				const chunk = getWorkoutChunk(i, meta.startedAt)
				if (chunk.length > 0) {
					allLoadedPoints.push(...chunk)
				}
				// Даем UI дышать
				if (i % 2 === 0) await new Promise((resolve) => setTimeout(resolve, 0))
			}

			if (!isMountedRef.current) return

			// [BUGFIX] Race Condition:
			// Пока мы грузили историю (await), могли прийти новые "живые" точки через onLocations.
			// Если мы просто сделаем pointsRef.current = allLoadedPoints, мы затрём эти новые точки.
			// Из-за этого маркер прыгнет назад (на конец истории), а потом снова вперёд.
			const incomingPointsDuringLoad = pointsRef.current

			// Простая защита от дублей по timestamp (если вдруг point успел попасть и в историю, и в live)
			const historyTimestamps = new Set(allLoadedPoints.map((p) => p.locationObject.timestamp))
			const uniqueIncomingPoints = incomingPointsDuringLoad.filter(
				(p) => !historyTimestamps.has(p.locationObject.timestamp)
			)

			console.log('uniqueIncomingPoints---------', uniqueIncomingPoints)
			// Мержим: История + То, что прилетело во время загрузки
			pointsRef.current = [...allLoadedPoints, ...uniqueIncomingPoints]

			// Считаем полную дистанцию один раз по актуальному массиву
			totalDist = calculateTotalDistance(pointsRef.current)
			accumulatedDistanceRef.current = totalDist

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
				setIsPaused(meta.isPaused)
				setIsWorkoutStarted(true)
				onInitialDataLoadedCallback(meta.type)
				initialDataLoadedSetRef.current = true
			} else if (pointsRef.current.length > 0 && isMountedRef.current) {
				// Fallback: если вью уже была запущена (крайний случай), обновляем императивно
				console.log('loadHistoryProgressively updatePath: 1')
				mapComponentRef.current?.updatePath(pointsRef.current)
				const last = pointsRef.current[pointsRef.current.length - 1]
				const { latitude, longitude } = last.locationObject.coords
				const pos = { lat: latitude, lon: longitude }
				userLocationMarkerRef.current?.setMarkerPosition(pos)
				mapComponentRef.current?.setMapCenter(pos, 0)
			}
		}
		// Сценарий 2: Догрузка после background (упрощенно)
		else {
			const lastKnownPoint = pointsRef.current[pointsRef.current.length - 1]
			const lastKnownRelTs = lastKnownPoint?.relTs ?? -1 // Используем relTs для фильтрации, так как timestamp может быть 0, если чанк десериализован без startedAt
			const newPoints: IWorkoutLocationStorageItem[] = []

			// Оптимизация: начинаем поиск с того чанка, где мы остановились (примерно),
			// или просто с последнего, если чанк не был заполнен.
			// Для надежности можно пройтись по всем (MMKV быстрый), или вычислить индекс
			const startChunkIdx = Math.max(0, Math.floor(pointsRef.current.length / CHUNK_POINT_COUNT))

			for (let i = startChunkIdx; i < totalChunks; i++) {
				if (!isMountedRef.current) return
				console.log(`loadHistoryProgressively let i = startChunkIdx; i < totalChunks; i++ idx: ${i}`)
				const chunk = getWorkoutChunk(i, meta.startedAt)
				// Фильтруем: берем только те, что новее нашей последней точки по relTs
				const freshPoints = chunk.filter((p) => {
					// 1. Точка должна быть новее последней известной
					if (p.relTs <= lastKnownRelTs) return false

					// 2. [FIX] Фильтр переполнения (Integer Underflow).
					// Если точка имеет timestamp 0 (старт или ошибка), а startedAt > 0,
					// relTs может стать огромным числом (~4294967xxx).
					// Отсекаем нереалистичные значения (например, > 2 млрд мс, это ~23 дня).
					const isCorruptedTimestamp = p.relTs > 2000000000
					if (isCorruptedTimestamp) {
						console.warn('loadHistoryProgressively: Ignored corrupted point (underflow)', p)
						return false
					}

					return true
				})

				console.log('freshPoints: ', freshPoints)

				if (freshPoints.length > 0) {
					newPoints.push(...freshPoints)
				}
			}

			if (newPoints.length > 0 && isMountedRef.current) {
				let gapDistance = 0

				// 1. Дистанция от старой последней до первой новой
				if (lastKnownPoint) {
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

				updateRealtimeMetrics(speed ?? 0)
			}
		}

		isLoadingRef.current = false
	}, [onInitialDataLoadedCallback, saveInitialMarkerLocation, updateRealtimeMetrics])

	/**
	 * Функция для полного сброса состояния тренировки и очистки карты.
	 * Вызывается при завершении тренировки.
	 */
	const resetWorkoutState = useCallback(() => {
		console.log('resetWorkoutState called')
		// 1. Сброс refs
		pointsRef.current = []
		accumulatedDistanceRef.current = 0
		initialMarkerLocationSetRef.current = false
		initialLocationsSetRef.current = false
		initialDataLoadedSetRef.current = false

		// 2. Сброс React State
		setInitialLocationsState([])
		setInitialMarkerLocationState(null)
		setIsWorkoutStarted(false)
		setIsPaused(false)

		// 3. Очистка карты (важно для удаления полилайна)
		mapComponentRef.current?.updatePath([])

		// 4. Сброс метрик
		metricSpeedRef.current?.setSpeed(0)
		metricDistanceRef.current?.setDistance(0)
		metricCaloriesRef.current?.setCalories(0, 0, workoutType)
		metricHeightRef.current?.updateHeight([])
	}, [workoutType])

	// Эффект для принудительного обновления метрик после монтирования компонентов тренировки
	// Это решает проблему пустых метрик при перезапуске приложения в состоянии "Пауза"
	useEffect(() => {
		if (isWorkoutStarted && pointsRef.current.length > 0 && isMountedRef.current) {
			const timer = setTimeout(() => {
				const lastPoint = pointsRef.current[pointsRef.current.length - 1]
				const speed = lastPoint.locationObject.coords.speed ?? 0
				updateRealtimeMetrics(speed, true)
			}, 300) // Задержка для гарантии монтирования refs

			return () => clearTimeout(timer)
		}
	}, [isWorkoutStarted, updateRealtimeMetrics])

	useEffect(() => {
		isMountedRef.current = true
		// Resolve the promise to indicate that the inner app has mounted
		if (resolver) {
			resolver?.()
		}
		let unsubscribe: (() => void) | null = null

		const subscribeToLocations = () => {
			if (unsubscribe) return // защита от двойной подписки

			console.log('Подписываемся на locationEmitter')
			unsubscribe = locationEmitter.subscribe(onLocations)
		}

		const unsubscribeFromLocations = () => {
			if (unsubscribe) {
				console.log('Отписываемся от locationEmitter')
				unsubscribe()
				unsubscribe = null
			}
		}

		const init = async () => {
			saveInitialLocations(pointsRef.current)
			await loadHistoryProgressively()
			if (appStateRef.current === 'active' && isMountedRef.current) subscribeToLocations()
		}

		init()

		const appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
			const prev = appStateRef.current
			appStateRef.current = nextAppState

			// Возвращение в активное состояние
			if (prev.match(/inactive|background/) && nextAppState === 'active') {
				// Принудительно проверяем состояние паузы из хранилища, так как оно могло измениться в шторке уведомлений
				const meta = getWorkoutMeta()
				if (meta && isMountedRef.current) {
					setIsPaused(meta.isPaused)
				}

				// Сначала догружаем пропущенные точки, потом подписываемся
				await loadHistoryProgressively()
				if (isMountedRef.current) subscribeToLocations()
			}
			// Переход в background
			if (prev === 'active' && nextAppState.match(/inactive|background/)) {
				unsubscribeFromLocations()
			}
		})

		return () => {
			isMountedRef.current = false
			unsubscribeFromLocations()
			appStateSubscription.remove()
		}
	}, [loadHistoryProgressively, onLocations, saveInitialLocations])

	return {
		mapComponentRef,
		userLocationMarkerRef,
		metricSpeedRef,
		metricDistanceRef,
		metricCaloriesRef,
		metricHeightRef,
		accumulatedDistanceRef,
		pointsRef,
		initialMarkerLocationSetRef,
		initialMarkerLocationState,
		initialLocationsState,
		isWorkoutStarted,
		isPaused,
		resetWorkoutState,
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
