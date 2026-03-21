import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { LocationActivityType, LocationObject } from 'expo-location'
import { getWorkoutMeta, setWorkoutItems } from '@/store/workoutStorage'
import { locationEmitter } from './locationEmitter'
import { TaskManagerError } from 'expo-task-manager'
import { getItem } from '@/store/storage'
// import { DeadReckoningEngine } from '@/helpers/location/DeadReckoningEngine'

export const LOCATION_TASK_NAME = 'background-location-task'
let innerAppMountedPromiseRef: Promise<void> | null = null // Variable to hold the promise resolver logic
// let deadReckoning: DeadReckoningEngine | null = null
// let accelerometerSensorRemover: () => void = () => {}
// let orientationAngle: number = 0

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
			deferredUpdatesDistance: 0, // для точности
			deferredUpdatesInterval: 0, // для точности
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
	// accelerometerSensorRemover()
	console.log('[tracking]', 'stopped background location task')
}

TaskManager.defineTask(
	LOCATION_TASK_NAME,
	async ({ data, error }: { data: { locations: LocationObject[] }; error: TaskManagerError | null }) => {
		// Delay starting the task until the inner app is mounted
		if (innerAppMountedPromiseRef) await innerAppMountedPromiseRef
		if (error) {
			console.error('Location task error:', error)
			return
		}

		const user = getItem('authData')?.user

		const meta = getWorkoutMeta(user?.id)
		if (!meta || !data?.locations?.length) return
		// const last = data.locations.at(-1)
		//
		// if (!deadReckoning) {
		// 	deadReckoning = new DeadReckoningEngine()
		// 	if (!last) return
		//
		// 	deadReckoning.setGeoAnchor({
		// 		lat: last.coords.latitude,
		// 		lng: last.coords.longitude,
		// 		alt: last.coords.altitude ?? 0
		// 	})
		// }

		// OPTIONAL:
		// если есть heading от GPS
		// if (last?.coords?.heading != null) {
		// 	deadReckoning.alignOrientation(last.coords.heading)
		// }

		// accelerometerSensorRemover = startPdrSensors(deadReckoning, (geo, orientationAngle) => {
		// 	console.log('новые координаты от pdr', geo)
		// 	// новые координаты от pdr
		// 	const savedLocations = setWorkoutItems([
		// 		{
		// 			coords: {
		// 				...geo,
		// 				accuracy: last?.coords.accuracy || 1,
		// 				altitudeAccuracy: last?.coords?.altitudeAccuracy || 1,
		// 				speed: last?.coords?.speed || 1,
		// 				heading: orientationAngle
		// 			},
		// 			timestamp: Date.now()
		// 		}
		// 	])
		// 	locationEmitter.emit(savedLocations)
		// })

		const savedLocations = setWorkoutItems(data.locations, user?.id)
		locationEmitter.emit(savedLocations)

		// const preparedLocations = savedLocations.map((item) => ({
		// 	relTs: item.relTs,
		// 	alt: item.locationObject.coords.altitude || 0,
		// 	speed_kmh: mpsToKmph(item.locationObject.coords.speed || 0),
		// 	paused: item.paused,
		// 	lat: item.locationObject.coords.latitude,
		// 	lng: item.locationObject.coords.longitude,
		// 	locationObject: {
		// 		coords: item.locationObject.coords,
		// 		timestamp: item.locationObject.timestamp
		// 	}
		// }))

		// 	syncTraining(meta.id, preparedLocations)
	}
)

export const initializeBackgroundLocationTask = async (innerAppMountedPromise: Promise<void>) => {
	// Assign the promise to the module-level variable so the task can use it
	innerAppMountedPromiseRef = innerAppMountedPromise
	console.log('[tracking] Background task initialized with mount promise')
}
