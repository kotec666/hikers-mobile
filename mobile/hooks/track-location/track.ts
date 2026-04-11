import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import { LocationActivityType, LocationObject } from 'expo-location'
import { getWorkoutMeta, markPointsAsSaved, setWorkoutItems } from '@/store/workoutStorage'
import { locationEmitter } from './locationEmitter'
import { TaskManagerError } from 'expo-task-manager'
import { syncTraining } from '@/api/workout'
import { prepareLocationsForSync } from '@/helpers/prepareLocationsForSync'
import { getItem } from '@/store/authStorage'
import { filterLocations } from '@/helpers/location/filterLocations'
// import { LiveActivity } from 'expo-widgets'
// import WorkoutActivity, {
// 	getActivityTypeIcon,
// 	WorkoutActivityProps
// } from '@/components/ui/LiveActivities/WorkoutActivity'
// import { Platform } from 'react-native'
// import { TrainingType } from '@shared/enums'
// import { WorkoutTypesMap } from '@/constants/WorkoutTypes'

export const LOCATION_TASK_NAME = 'background-location-task'
let innerAppMountedPromiseRef: Promise<void> | null = null // Variable to hold the promise resolver logic
// let liveActivityWorkoutInstance: LiveActivity<WorkoutActivityProps> | null = null

// const startWorkoutActivity = () => {
// 	if (Platform.OS !== 'ios') return
// 	// Start the Live Activity
// 	const instance = WorkoutActivity.start({
// 		formattedDistance: '1.07',
// 		formattedTime: '0',
// 		formattedSpeed: '7.5',
// 		isPaused: false,
// 		icon: getActivityTypeIcon(TrainingType.WALK),
// 		typeLabel: WorkoutTypesMap?.[TrainingType.WALK]?.name ?? 'Тренировка'
// 	})
// 	// Store instance
// 	liveActivityWorkoutInstance = instance
// }

// const updateWorkoutActivity = (newTimestamp?: number) => {
// 	if (Platform.OS !== 'ios') return
// 	if (!liveActivityWorkoutInstance) return
// 	liveActivityWorkoutInstance.update({
// 		formattedDistance: '1.07',
// 		formattedTime: `${newTimestamp}`, //'0:07',
// 		formattedSpeed: '7.5',
// 		isPaused: true,
// 		icon: getActivityTypeIcon(TrainingType.WALK),
// 		typeLabel: WorkoutTypesMap?.[TrainingType.WALK]?.name ?? 'Тренировка'
// 	})
// }

// const endWorkoutActivity = () => {
// 	if (Platform.OS !== 'ios') return
// 	if (!liveActivityWorkoutInstance) return
// 	liveActivityWorkoutInstance.end('immediate')
// }

// const liveActivityWorkoutInstanceRef = useRef<LiveActivity<WorkoutActivityProps>>(null)
//
// const startWorkoutActivity = () => {
// 	// Start the Live Activity
// 	const instance = WorkoutActivity.start({
// 		formattedDistance: '1.07',
// 		formattedTime: '0:07',
// 		formattedSpeed: '7.5',
// 		isPaused: false,
// 		icon: getActivityTypeIcon(TrainingType.WALK),
// 		typeLabel: WorkoutTypesMap?.[TrainingType.WALK]?.name ?? 'Тренировка'
// 	})
// 	liveActivityWorkoutInstanceRef.current = instance
// 	// Store instance
// }
//
// const updateWorkoutActivity = () => {
// 	if (!liveActivityWorkoutInstanceRef.current) return
// 	liveActivityWorkoutInstanceRef.current.update({
// 		formattedDistance: '1.07',
// 		formattedTime: '0:07',
// 		formattedSpeed: '7.5',
// 		isPaused: true,
// 		icon: getActivityTypeIcon(TrainingType.WALK),
// 		typeLabel: WorkoutTypesMap?.[TrainingType.WALK]?.name ?? 'Тренировка'
// 	})
// }
//
// const endWorkoutActivity = () => {
// 	if (!liveActivityWorkoutInstanceRef.current) return
// 	liveActivityWorkoutInstanceRef.current.end('immediate')
// }

export async function isTrackingLocation(): Promise<boolean> {
	return await Location.hasStartedLocationUpdatesAsync(LOCATION_TASK_NAME)
}

export async function startTracking() {
	// startWorkoutActivity()
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
	// endWorkoutActivity()
	if (await isTrackingLocation()) {
		await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
		console.log('[tracking]', 'stopped background location task')
	}
}

TaskManager.defineTask(
	LOCATION_TASK_NAME,
	async ({ data, error }: { data: { locations: LocationObject[] }; error: TaskManagerError | null }) => {
		const user = (await getItem('authData'))?.user
		// Delay starting the task until the inner app is mounted
		if (innerAppMountedPromiseRef) await innerAppMountedPromiseRef
		if (error) {
			console.error('Location task error:', error)
			return
		}

		const meta = getWorkoutMeta(user?.id)
		if (!meta || !data?.locations?.length) return
		const cleanedLocations = filterLocations(data.locations, { keepLast: true })
		// updateWorkoutActivity(cleanedLocations.at(-1)?.timestamp) // @TODO проверка liveActivity ios в бэкграунде
		const savedLocations = setWorkoutItems(cleanedLocations, user?.id)
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
