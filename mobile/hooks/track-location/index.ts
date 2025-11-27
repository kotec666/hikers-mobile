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
import { MapComponentSegmentsArrayHandle } from '@/components/map/MapComponentSegmentsArray'
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
	onInitialDataLoadedCallback: () => void,
	workoutType: TrainingType
) {
	const mapComponentRef = useRef<MapComponentSegmentsHandle>(null)
	const userLocationMarkerRef = useRef<UserLocationMarkerHandle>(null)

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

	const saveInitialLocations = useCallback(
		(initialLocations: IWorkoutLocationStorageItem[] | IWorkoutLocationStorageItem | null) => {
			if (initialLocationsSetRef.current) return

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

	const saveInitialMarkerLocation = useCallback((newLatLon: { lat: number; lon: number }) => {
		if (!initialMarkerLocationSetRef.current) {
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
	 */
	const updateRealtimeMetrics = useCallback(
		(currentSpeed: number) => {
			if (isPausedRef.current) return
			// 1. Скорость
			metricSpeedRef.current?.setSpeed(currentSpeed)
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
							batchDistance += getDist(previousPoint, item)
						}
						previousPoint = item
					}

					accumulatedDistanceRef.current += batchDistance

					// Обновляем метрики UI
					updateRealtimeMetrics(speed ?? 0)
				}
			}
		},
		[isPausedRef, saveInitialLocations, saveInitialMarkerLocation, updateRealtimeMetrics]
	)

	// Функция постепенной загрузки истории (с конца)
	const loadHistoryProgressively = useCallback(async () => {
		console.log('loadHistoryProgressively')
		const meta = getWorkoutMeta()
		if (!meta) return

		if (!initialDataLoadedSetRef.current) {
			setIsPaused(meta.isPaused)
			setIsWorkoutStarted(true)
			onInitialDataLoadedCallback()
			initialDataLoadedSetRef.current = true
		}

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
				const chunk = getWorkoutChunk(i)
				if (chunk.length > 0) {
					allLoadedPoints.push(...chunk)
				}
				// Даем UI дышать
				if (i % 2 === 0) await new Promise((resolve) => setTimeout(resolve, 0))
			}

			// Считаем полную дистанцию один раз
			totalDist = calculateTotalDistance(allLoadedPoints)
			accumulatedDistanceRef.current = totalDist
			pointsRef.current = allLoadedPoints

			// Инициализируем UI
			mapComponentRef.current?.updatePath(pointsRef.current)

			if (pointsRef.current.length > 0) {
				const last = pointsRef.current[pointsRef.current.length - 1]
				const { latitude, longitude, speed } = last.locationObject.coords
				const pos = { lat: latitude, lon: longitude }

				saveInitialMarkerLocation(pos)
				userLocationMarkerRef.current?.setMarkerPosition(pos)
				mapComponentRef.current?.setMapCenter(pos, 0)

				// Init metrics
				updateRealtimeMetrics(speed ?? 0)
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
				const chunk = getWorkoutChunk(i)
				// Фильтруем: берем только те, что новее нашей последней точки по relTs
				const freshPoints = chunk.filter((p) => p.relTs > lastKnownRelTs)
				if (freshPoints.length > 0) {
					newPoints.push(...freshPoints)
				}
			}

			if (newPoints.length > 0) {
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

	useEffect(() => {
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
			if (appStateRef.current === 'active') subscribeToLocations()
		}

		init()

		const appStateSubscription = AppState.addEventListener('change', async (nextAppState: AppStateStatus) => {
			const prev = appStateRef.current
			appStateRef.current = nextAppState

			// Возвращение в активное состояние
			if (prev.match(/inactive|background/) && nextAppState === 'active') {
				// Сначала догружаем пропущенные точки, потом подписываемся
				await loadHistoryProgressively()
				subscribeToLocations()
			}
			// Переход в background
			if (prev === 'active' && nextAppState.match(/inactive|background/)) {
				unsubscribeFromLocations()
			}
		})

		return () => {
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
