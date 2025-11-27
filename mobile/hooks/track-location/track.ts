import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { LocationActivityType, LocationObject } from 'expo-location'
import { getWorkoutChunk, getWorkoutMeta, setWorkoutItems } from '@/store/workoutStorage'
import { locationEmitter } from './locationEmitter'
import { InfiniteMockRoute } from '@/helpers/generateInfiniteRoute'

export const LOCATION_TASK_NAME = 'background-location-task'

export async function isTrackingLocation(): Promise<boolean> {
	return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
}

export async function startTracking() {
	if (!(await isTrackingLocation())) {
		await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
			accuracy: Location.Accuracy.BestForNavigation,
			//timeInterval: 15 * 1000, // 15 sec.
			timeInterval: 3 * 1000, // 3 sec.
			// android behavior
			foregroundService: {
				notificationTitle: 'Отслеживание местоположения',
				notificationBody: 'Приложение собирает данные о вашем местоположении',
				notificationColor: 'rgba(0,0,0,0)',
				killServiceOnDestroy: false
			},
			deferredUpdatesDistance: 1,
			// ios behavior
			activityType: LocationActivityType.Fitness,
			pausesUpdatesAutomatically: false,
			showsBackgroundLocationIndicator: true
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
let infiniteRoute: InfiniteMockRoute | null = null

const DEFAULT_START_LAT = 53.37437133195321
const DEFAULT_START_LON = 49.45812837251587

// создаём генератор при старте приложения или таска
// const mockRoute = new StructuredMockRoute(53.37437133195321, 49.45812837251587)
// const infiniteRoute = new InfiniteMockRoute(53.37437133195321, 49.45812837251587)
//
// const segments = [
// 	{ heading: 180, length: 10, step: 0.0001 }, // вниз
// 	{ heading: 90, length: 10, step: 0.0001 } // вправо
// ]

export const initializeBackgroundLocationTask = async (innerAppMountedPromise: Promise<void>) => {
	TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
		// Delay starting the task until the inner app is mounted
		await innerAppMountedPromise
		if (error) {
			console.error('Location task error:', error)
			return
		}

		// Restore generator state if it was lost (e.g. after app restart)
		if (!infiniteRoute) {
			const meta = getWorkoutMeta()
			let startLat = DEFAULT_START_LAT
			let startLon = DEFAULT_START_LON

			if (meta && meta.chunkCount > 0) {
				const lastChunk = getWorkoutChunk(meta.chunkCount - 1)
				if (lastChunk && lastChunk.length > 0) {
					const lastPoint = lastChunk[lastChunk.length - 1]
					startLat = lastPoint.locationObject.coords.latitude
					startLon = lastPoint.locationObject.coords.longitude
					console.log('[tracking] Restored mock route from:', startLat, startLon)
				}
			}
			infiniteRoute = new InfiniteMockRoute(startLat, startLon)
		}

		const meta = getWorkoutMeta()
		if (!meta) return
		if (data) {
			const { locations } = data as { locations: LocationObject[] }
			// console.log('Received background locations', locations) // @TODO фильтрация неточных точек + Ramer-Douglas-Peucker algorithm + Kalman filter
			// const savedLocations = setWorkoutItems(locations)
			// const newLocations = mockRoute.nextPoints(segments) // вниз -> вправо зациклено
			const newLocations = infiniteRoute.nextPoints(10, 0.0001, 2) // 2 сегмента по 10 точек
			const savedLocations = setWorkoutItems(newLocations)
			locationEmitter.emit(savedLocations)
		}
	})
}
