import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { LocationActivityType, LocationObject } from 'expo-location'
import { getWorkoutMeta, markPointsAsSaved, setWorkoutItems } from '@/store/workoutStorage'
import { locationEmitter } from './locationEmitter'
import { TaskManagerError } from 'expo-task-manager'
import { syncTraining } from '@/api/workout'
import { prepareLocationsForSync } from '@/helpers/prepareLocationsForSync'
import { getItem } from '@/store/storage'

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
	if (await isTrackingLocation()) {
		await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
		console.log('[tracking]', 'stopped background location task')
	}
}

TaskManager.defineTask(
	LOCATION_TASK_NAME,
	async ({ data, error }: { data: { locations: LocationObject[] }; error: TaskManagerError | null }) => {
		const user = getItem('authData')?.user
		// Delay starting the task until the inner app is mounted
		if (innerAppMountedPromiseRef) await innerAppMountedPromiseRef
		if (error) {
			console.error('Location task error:', error)
			return
		}

		const meta = getWorkoutMeta(user?.id)
		if (!meta || !data?.locations?.length) return

		const savedLocations = setWorkoutItems(data.locations, user?.id)
		locationEmitter.emit(savedLocations)

		const preparedLocations = prepareLocationsForSync(savedLocations)

		try {
			if (preparedLocations.length === 0) return
			const result = await syncTraining(meta.id, preparedLocations)
			if (result.success) {
				markPointsAsSaved(
					preparedLocations.map((item) => item.pointId),
					user?.id
				)
			}
		} catch {}
	}
)

export const initializeBackgroundLocationTask = async (innerAppMountedPromise: Promise<void>) => {
	// Assign the promise to the module-level variable so the task can use it
	innerAppMountedPromiseRef = innerAppMountedPromise
	console.log('[tracking] Background task initialized with mount promise')
}
