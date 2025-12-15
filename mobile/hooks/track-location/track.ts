import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { LocationActivityType, LocationObject } from 'expo-location'
import { getWorkoutMeta, setWorkoutItems } from '@/store/workoutStorage'
import { locationEmitter } from './locationEmitter'
import { mpsToKmph } from '@/helpers/mpsToKmph'
import { syncTraining } from '@/api/workout'
import { GPSKalmanFilter } from '@/helpers/location/GPSKalmanFilter'
import {
	KALMAN_DECAY_BY_ACTIVITY,
	MIN_ACCURACY_BY_ACTIVITY,
	MAX_SPEED_BY_ACTIVITY,
	JITTER_FACTOR
} from '@/helpers/location/kalmanConfig'
import { haversineDistance } from '@shared/helpers'
import { TaskManagerError } from 'expo-task-manager'
import { TrainingType } from '@shared/enums'

let kalmanFilter: GPSKalmanFilter | null = null
let lastMetaId: string | null = null
let lastMetaType: TrainingType | null = null

export const LOCATION_TASK_NAME = 'background-location-task'
let innerAppMountedPromiseRef: Promise<void> | null = null // Variable to hold the promise resolver logic

export async function isTrackingLocation(): Promise<boolean> {
	return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
}

export async function startTracking() {
	if (!(await isTrackingLocation())) {
		await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
			accuracy: Location.Accuracy.BestForNavigation,
			timeInterval: 3 * 1000, // 3 sec.
			distanceInterval: 5,
			// Когда можно отдавать "пакет" точек сразу,
			// снижает энергопотребление (особенно на iOS).
			deferredUpdatesDistance: 10,
			deferredUpdatesInterval: 3000, // 3 сек
			// android behavior
			foregroundService: {
				notificationTitle: 'Отслеживание местоположения',
				notificationBody: 'Приложение собирает данные о вашем местоположении',
				notificationColor: 'rgba(0,0,0,0)',
				killServiceOnDestroy: false
			},
			// ios behavior
			activityType: LocationActivityType.Fitness,
			pausesUpdatesAutomatically: false,
			showsBackgroundLocationIndicator: false
		})
		console.log('[tracking]', 'started background location task')
	} else {
		console.log('[tracking]', 'background location task is already started')
	}
}

export async function stopTracking() {
	await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
	kalmanFilter = null
	lastMetaId = null
	lastMetaType = null
	console.log('[tracking]', 'stopped background location task')
}

// Move generator to module scope but initialize lazily
// let infiniteRoute: InfiniteMockRoute | null = null
//
// const DEFAULT_START_LAT = 53.37437133195321
// const DEFAULT_START_LON = 49.45812837251587

// создаём генератор при старте приложения или таска
// const mockRoute = new StructuredMockRoute(53.37437133195321, 49.45812837251587)
// const infiniteRoute = new InfiniteMockRoute(53.37437133195321, 49.45812837251587)
//
// const segments = [
// 	{ heading: 180, length: 10, step: 0.0001 }, // вниз
// 	{ heading: 90, length: 10, step: 0.0001 } // вправо
// ]

TaskManager.defineTask(
	LOCATION_TASK_NAME,
	async ({ data, error }: { data: { locations: LocationObject[] }; error: TaskManagerError | null }) => {
		// Delay starting the task until the inner app is mounted
		if (innerAppMountedPromiseRef) await innerAppMountedPromiseRef
		if (error) {
			console.error('Location task error:', error)
			return
		}

		// Restore generator state if it was lost (e.g. after app restart)
		// if (!infiniteRoute) {
		// 	const meta = getWorkoutMeta()
		// 	let startLat = DEFAULT_START_LAT
		// 	let startLon = DEFAULT_START_LON
		//
		// 	if (meta && meta.chunkCount > 0) {
		// 		const lastChunk = getWorkoutChunk(meta.chunkCount - 1)
		// 		if (lastChunk && lastChunk.length > 0) {
		// 			const lastPoint = lastChunk[lastChunk.length - 1]
		// 			startLat = lastPoint.locationObject.coords.latitude
		// 			startLon = lastPoint.locationObject.coords.longitude
		// 			console.log('[tracking] Restored mock route from:', startLat, startLon)
		// 		}
		// 	}
		// 	infiniteRoute = new InfiniteMockRoute(startLat, startLon)
		// }

		const meta = getWorkoutMeta()
		if (!meta) return

		// Reset фильтра при смене тренировки или типа активности
		if (!kalmanFilter || meta.id !== lastMetaId || meta.type !== lastMetaType) {
			const decay = KALMAN_DECAY_BY_ACTIVITY[meta.type]
			const minAccuracy = MIN_ACCURACY_BY_ACTIVITY[meta.type]
			kalmanFilter = new GPSKalmanFilter(decay, minAccuracy)
			lastMetaId = meta.id
			lastMetaType = meta.type
		}

		if (!data?.locations?.length) return

		const filteredLocations: LocationObject[] = data.locations.map((loc) => {
			if (!kalmanFilter) return loc

			const { latitude, longitude, accuracy, speed } = loc.coords
			const timestamp = loc.timestamp

			if ([latitude, longitude, timestamp].some((v) => v == null)) return loc
			const safeAccuracy = accuracy ?? MIN_ACCURACY_BY_ACTIVITY[meta.type] // not null

			const dt = timestamp - kalmanFilter.getTimestamp()
			const cappedDt = Math.min(dt, 120_000) // максимум 2 минуты для анти-спайка

			const distance = haversineDistance(kalmanFilter.getLat(), kalmanFilter.getLng(), latitude, longitude)
			const maxPossibleDist = ((MAX_SPEED_BY_ACTIVITY[meta.type] * cappedDt) / 1000) * JITTER_FACTOR // при долгом отсутствии GPS фильтр “перескакивает” на новое положение. Это поведение намеренное, но стоит задокументировать.

			// Анти-спайк
			if (distance > maxPossibleDist) {
				kalmanFilter.reset(latitude, longitude, safeAccuracy, timestamp)
				return loc
			}

			// Reset при стоянии
			if (speed != null && speed < 0.3 && dt > 5_000) {
				kalmanFilter.reset(latitude, longitude, safeAccuracy, timestamp)
				return loc
			}

			const filtered = kalmanFilter.filter(latitude, longitude, safeAccuracy, timestamp, speed)

			return {
				...loc,
				coords: {
					...loc.coords,
					latitude: filtered.lat,
					longitude: filtered.lng
				}
			}
		})

		const savedLocations = setWorkoutItems(filteredLocations)

		// const newLocations = mockRoute.nextPoints(segments) // вниз -> вправо зациклено
		// const newLocations = infiniteRoute.nextPoints(10, 0.0001, 2) // 2 сегмента по 10 точек
		// const savedLocations = setWorkoutItems(newLocations)
		locationEmitter.emit(savedLocations)

		const preparedLocations = savedLocations.map((item) => ({
			relTs: item.relTs,
			alt: item.locationObject.coords.altitude || 0,
			speed_kmh: mpsToKmph(item.locationObject.coords.speed || 0),
			paused: item.isPausedPoint,
			lat: item.locationObject.coords.latitude,
			lng: item.locationObject.coords.longitude,
			locationObject: {
				coords: item.locationObject.coords,
				timestamp: item.locationObject.timestamp
			}
		}))

		syncTraining(meta.id, preparedLocations)
	}
)

export const initializeBackgroundLocationTask = async (innerAppMountedPromise: Promise<void>) => {
	// Assign the promise to the module-level variable so the task can use it
	innerAppMountedPromiseRef = innerAppMountedPromise
	console.log('[tracking] Background task initialized with mount promise')
}
