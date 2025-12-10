import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { LocationActivityType, LocationObject } from 'expo-location'
import { getWorkoutMeta, setWorkoutItems } from '@/store/workoutStorage'
import { locationEmitter } from './locationEmitter'
import { mpsToKmph } from '@/helpers/mpsToKmph'
import { syncTraining } from '@/api/workout'

export const LOCATION_TASK_NAME = 'background-location-task'

// Variable to hold the promise resolver logic
let innerAppMountedPromiseRef: Promise<void> | null = null

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
			deferredUpdatesDistance: 20,
			deferredUpdatesInterval: 5000, // 5 сек
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

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
	// Delay starting the task until the inner app is mounted
	if (innerAppMountedPromiseRef) {
		await innerAppMountedPromiseRef
	}
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
	if (data) {
		const { locations } = data as { locations: LocationObject[] }
		if (!locations || locations.length === 0) return

		console.log('Received background locations', locations)
		const savedLocations = setWorkoutItems(locations)

		console.log('savedLocations', savedLocations)
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
})

export const initializeBackgroundLocationTask = async (innerAppMountedPromise: Promise<void>) => {
	// Assign the promise to the module-level variable so the task can use it
	innerAppMountedPromiseRef = innerAppMountedPromise
	console.log('[tracking] Background task initialized with mount promise')
}
