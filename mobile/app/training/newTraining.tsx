import { PermissionsAndroid, Platform, SafeAreaView, StyleSheet } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import React, { useEffect, useRef, useState } from 'react'
import WorkoutRunning from '@/components/svg/WorkoutRunning'
import WorkoutWalking from '@/components/svg/WorkoutWalking'
import WorkoutBicycle from '@/components/svg/WorkoutBicycle'
import * as Location from 'expo-location'
import { LocationActivityType, LocationObject } from 'expo-location'
import { useToast } from '@/hooks/useToast'
import WorkoutStarted from '@/components/training/WorkoutStarted'
import NewWorkout, { IWorkoutModeElement } from '@/components/training/NewWorkout'
import * as TaskManager from 'expo-task-manager'
import {
	getAllWorkoutStorage,
	IWorkout,
	IWorkoutLocationStorageItem,
	moveActiveWorkoutToNotSaved,
	setActiveWorkoutPauseState,
	setWorkoutItem,
	setWorkoutItems,
	startAndStoreNewActiveWorkout
} from '@/store/workoutStorage'
import { ILatLng } from '@/components/map/MapComponent'
import { useRouter } from 'expo-router'
import { useLatest } from '@/hooks/useLatest'
import { initializeNotifications } from '@/helpers/notifications'
import { formatTime } from '@/helpers/formatTime'
import notifee, {
	AndroidForegroundServiceType,
	AndroidImportance,
	AndroidVisibility,
	EventType
} from '@notifee/react-native'
import { AllGeolocationPermissionsHandle } from '@/components/AllGeolocationPermissions'
import * as Notification from 'expo-notifications'
import { TrainingType } from '../../../shared/enums'

initializeNotifications()

const WorkoutTypesData = [
	{ id: 1, type: TrainingType.RUN, name: 'Забег', IconComponent: WorkoutRunning },
	{ id: 2, type: TrainingType.RUN, name: 'Ходьба', IconComponent: WorkoutWalking },
	{ id: 3, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 4, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 5, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 6, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 7, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 8, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 9, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 10, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 11, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 12, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 13, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 14, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 15, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 16, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 17, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 18, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 19, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 20, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 21, type: TrainingType.BICYCLE, name: 'Велосипед', IconComponent: WorkoutBicycle },
	{ id: 22, type: TrainingType.BICYCLE, name: 'Велосипед last', IconComponent: WorkoutBicycle }
]

const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
	if (error) {
		console.error('Location task error:', error)
		return
	}

	if (data) {
		const { locations } = data as { locations: LocationObject[] | LocationObject }
		console.log('Received background locations', locations)

		if (Array.isArray(locations)) {
			setWorkoutItems(locations)
		} else {
			setWorkoutItem(locations)
		}
	}
})

const DEFAULT_MAP_CENTER = { lat: 55.758745, lon: 37.619153 }

export default function NewTraining() {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const router = useRouter()
	const permissionsRef = useRef<AllGeolocationPermissionsHandle>(null)
	const locationSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const headingSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const notificationIntervalRef = useRef<null | NodeJS.Timeout>(null)
	const [mapCenter, setMapCenter] = useState<ILatLng>(DEFAULT_MAP_CENTER) // { lat: 53.374427, lon: 49.460595 } // @TODO
	const [markerPosition, setMarkerPosition] = useState<ILatLng | null>(null) // { lat: 53.422506, lon: 49.4781051 }
	const [accuracy, setAccuracy] = useState<number | null>(null)
	const [heading, setHeading] = useState(0)
	const [speedMPS, setSpeedMPS] = useState(0) // метры в секунду
	const [altitude, setAltitude] = useState(0) // Высота в метрах над опорным эллипсоидом WGS 84.

	const [state, setState] = useState<{
		chosenWorkout: IWorkoutModeElement
		isWorkoutStarted: boolean
		isPaused: boolean
		myLocations: IWorkoutLocationStorageItem[]
	}>({
		chosenWorkout: WorkoutTypesData[0],
		isWorkoutStarted: false,
		isPaused: false,
		myLocations: []
	})

	const isPausedRef = useLatest(state.isPaused)

	useEffect(() => {
		// @TODO useLayoutEffect?
		const workoutStorage = getAllWorkoutStorage()
		const activeWorkout = workoutStorage.activeWorkout

		if (activeWorkout) {
			const foundedWorkout = WorkoutTypesData.find((w) => w.type === activeWorkout.type) ?? WorkoutTypesData[0]
			setState((s) => ({
				...s,
				isPaused: activeWorkout.isPaused,
				myLocations: activeWorkout.locations,
				isWorkoutStarted: true,
				chosenWorkout: foundedWorkout
			}))
		}
	}, [])

	const startBackgroundTracking = async () => {
		const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)

		if (!isTaskRegistered) {
			// Запускаем фоновое отслеживание
			await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
				accuracy: Location.Accuracy.BestForNavigation,
				distanceInterval: 1,
				foregroundService: {
					notificationTitle: 'Отслеживание местоположения',
					notificationBody: 'Приложение собирает данные о вашем местоположении',
					notificationColor: 'rgba(0,0,0,0)',
					killServiceOnDestroy: false
				},
				showsBackgroundLocationIndicator: true,
				deferredUpdatesDistance: 1,
				pausesUpdatesAutomatically: false,
				activityType: LocationActivityType.Fitness
			})
		}
	}

	const stopBackgroundTracking = async () => {
		const isTaskRegistered = await TaskManager.isTaskRegisteredAsync(LOCATION_TASK_NAME)
		if (isTaskRegistered) {
			await Location.stopLocationUpdatesAsync(LOCATION_TASK_NAME)
		}
	}

	const saveLocationToStorageAndState = (location: LocationObject) => {
		setState((s) => {
			const lastSavedWorkoutItem = setWorkoutItem(location) // Сохраняем в локальное хранилище

			if (s.myLocations?.find((loc) => loc.rel_ts === lastSavedWorkoutItem.rel_ts)) {
				// защита от дублирования, если такая локация уже существует в локальном стейте
				return s
			}

			if (s.myLocations.length) {
				return {
					...s,
					myLocations: [...s.myLocations, lastSavedWorkoutItem]
				}
			} else {
				return { ...s, myLocations: [lastSavedWorkoutItem] }
			}
		})
	}

	const startTracking = async () => {
		try {
			await startBackgroundTracking()
			// Запускаем отслеживание в foreground
			locationSubscriptionRef.current = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.BestForNavigation,
					distanceInterval: 1
				},
				(location) => {
					// Фильтруем неточные точки
					if (location.coords.accuracy && location.coords.accuracy > 50) {
						// 50 метров
						console.warn('Пропущена неточная точка:', location.coords.accuracy)
						return
					}
					setMarkerPosition({ lat: location.coords.latitude, lon: location.coords.longitude })
					setAccuracy(location.coords.accuracy)

					if (!isPausedRef.current) {
						setSpeedMPS(location.coords.speed ?? 0)
						setAltitude(location.coords.altitude ?? 0)
					}

					saveLocationToStorageAndState(location)
				}
			)
		} catch (e) {
			console.error('Ошибка запуска отслеживания:', e)
			toast.error('Ошибка запуска отслеживания местоположения')
		}
	}

	const startHeadingTracking = async () => {
		headingSubscriptionRef.current = await Location.watchHeadingAsync((data) => {
			setHeading(data.trueHeading ?? data.magHeading)
		})
	}

	const checkPermissions = async () => {
		const foregroundStatus = await Location.getForegroundPermissionsAsync()
		const backgroundStatus = await Location.getBackgroundPermissionsAsync()
		const isGPSEnabled = await Location.hasServicesEnabledAsync()
		let isPhysicalActivityPermissionGranted = false
		let isNotificationsGranted = false

		if (Platform.OS === 'android') {
			const { granted: notificationsGranted } = await Notification.getPermissionsAsync() // Пока что уведомления нужны только для android
			isNotificationsGranted = notificationsGranted
			isPhysicalActivityPermissionGranted = await PermissionsAndroid.check(
				PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
			)
		}

		return {
			foregroundStatus,
			backgroundStatus,
			isGPSEnabled,
			isPhysicalActivityPermissionGranted,
			isNotificationsGranted
		}
	}

	const getLastUserPosition = async (): Promise<Location.LocationObject> => {
		return await Location.getCurrentPositionAsync()
	}

	const handleClickStart = async () => {
		try {
			const {
				foregroundStatus,
				backgroundStatus,
				isGPSEnabled,
				isPhysicalActivityPermissionGranted,
				isNotificationsGranted
			} = await checkPermissions()

			// --- iOS и Android: базовые проверки геолокации ---
			const hasLocationPermissions = foregroundStatus?.granted && backgroundStatus?.granted && isGPSEnabled

			// --- Android: дополнительные проверки уведомлений и физ. активности ---
			const hasAndroidExtras =
				Platform.OS === 'android' ? isNotificationsGranted && isPhysicalActivityPermissionGranted : true // на iOS просто true

			// --- Проверка всех обязательных разрешений ---
			if (!hasLocationPermissions || !hasAndroidExtras) {
				toast.error('Невозможно начать тренировку без предоставления всех разрешений')
				return permissionsRef.current?.checkPermissions()
			}

			// --- Все разрешения есть, запускаем тренировку ---
			startAndStoreNewActiveWorkout(state.chosenWorkout.type)
			console.log('chosenWorkout', state.chosenWorkout)

			setState((s) => ({ ...s, isWorkoutStarted: true }))

			await startHeadingTracking()
			if (isNotificationsGranted && isPhysicalActivityPermissionGranted) {
				await startNotificationTimer() // опционально, если уведомления разрешены
			}

			return startTracking()
		} catch (error) {
			console.error('Ошибка при старте тренировки:', error)
			toast.error('Произошла ошибка при запуске тренировки')
		}
	}

	const handleChangeWorkout = (workoutId: number) => {
		const foundedWorkout = WorkoutTypesData.find((workout) => workout.id === workoutId)
		if (!foundedWorkout) return
		setState((s) => ({ ...s, chosenWorkout: foundedWorkout }))
	}

	const allPermissionsGrantedCallback = async () => {
		const lastUserPosition = await getLastUserPosition()
		setMarkerPosition({ lat: lastUserPosition.coords.latitude, lon: lastUserPosition.coords.longitude })
		// setMapCenter({ lat: lastUserPosition.coords.latitude, lon: lastUserPosition.coords.longitude }) @TODO
	}

	const handleClickPause = async () => {
		setSpeedMPS(0)
		setState((s) => {
			const nextPauseState = !s.isPaused
			setActiveWorkoutPauseState(nextPauseState)
			return { ...s, isPaused: nextPauseState }
		})
		const lastUserPosition = await getLastUserPosition()
		saveLocationToStorageAndState(lastUserPosition)
	}

	const stopNotificationTimer = async () => {
		await notifee.stopForegroundService()
		if (notificationIntervalRef.current) {
			clearInterval(notificationIntervalRef.current)
			notificationIntervalRef.current = null
		}
	}

	const handleClickEndWorkout = async () => {
		// @TODO требуется проверка на то что тренировка завершилась слишком рано
		const lastUserPosition = await getLastUserPosition()
		await stopBackgroundTracking()
		saveLocationToStorageAndState(lastUserPosition)
		moveActiveWorkoutToNotSaved() // Наверное эта строка крашит приложение, т.к. все данные становятся null + undefined
		if (locationSubscriptionRef.current) {
			locationSubscriptionRef.current.remove()
			locationSubscriptionRef.current = null
		}
		if (headingSubscriptionRef.current) {
			headingSubscriptionRef.current.remove()
			headingSubscriptionRef.current = null
		}
		await stopNotificationTimer()
		setState((s) => ({
			...s,
			isWorkoutStarted: false,
			isPaused: false,
			myLocations: []
		}))
		setMarkerPosition(null)
		setAccuracy(null)
		setHeading(0)
		router.push('/training/viewWorkout')
	}

	const loadAndSetSavedLocations = () => {
		const WorkoutStorage = getAllWorkoutStorage()

		const locations = WorkoutStorage.activeWorkout?.locations
		if (locations) {
			setState((s) => ({ ...s, myLocations: locations }))
		}
	}

	useEffect(() => {
		loadAndSetSavedLocations()

		return () => {
			if (locationSubscriptionRef.current) {
				locationSubscriptionRef.current.remove()
				locationSubscriptionRef.current = null
			}
			if (headingSubscriptionRef.current) {
				headingSubscriptionRef.current.remove()
				headingSubscriptionRef.current = null
			}
			stopNotificationTimer()
		}
	}, [])

	const createChannel = async () => {
		await notifee.createChannel({
			id: 'workout',
			name: 'Отслеживание тренировки',
			importance: AndroidImportance.LOW
		})
	}

	const updateNotification = async (active: IWorkout) => {
		let actions = []

		if (active.isPaused) {
			actions = [{ title: 'Продолжить', pressAction: { id: 'resume' } }]
		} else {
			actions = [{ title: 'Пауза', pressAction: { id: 'pause' } }]
		}

		let elapsed
		if (active.isPaused && active.lastPauseAt) {
			elapsed = active.lastPauseAt - active.startedAt - active.totalPausedMs
		} else {
			elapsed = Date.now() - active.startedAt - active.totalPausedMs
		}

		const formatted = formatTime(elapsed)
		await notifee.displayNotification({
			id: 'workout-timer',
			title: 'Тренировка',
			body: formatted,
			android: {
				channelId: 'workout',
				asForegroundService: true,
				autoCancel: false,
				foregroundServiceTypes: [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_HEALTH],
				importance: AndroidImportance.LOW,
				ongoing: true,
				visibility: AndroidVisibility.PUBLIC,
				pressAction: {
					id: 'default'
					// launchActivity: '', // @TODO?
					// launchActivityFlags: [],
					// mainComponent: ''
				},
				actions: actions
			}
		})
	}

	const startNotificationTimer = async () => {
		// @TODO if not Android
		const { granted: notificationsGranted } = await Notification.getPermissionsAsync()
		const activityRecognitionPerms = await PermissionsAndroid.request(
			PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
		)

		if (activityRecognitionPerms !== PermissionsAndroid.RESULTS.GRANTED || !notificationsGranted) return
		await createChannel()

		notificationIntervalRef.current = setInterval(() => {
			const { activeWorkout: active } = getAllWorkoutStorage()

			if (!active) {
				return toast.error('Нет активной тренировки для показа уведомления')
			}

			updateNotification(active)
		}, 1000)
	}

	useEffect(() => {
		return notifee.onForegroundEvent(async ({ type, detail }) => {
			if (type === EventType.ACTION_PRESS) {
				if (!detail.pressAction) return
				if (detail.pressAction.id === 'pause') await handleClickPause()
				if (detail.pressAction.id === 'resume') await handleClickPause()
			}
		})
	}, [])

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaView style={styles.container}>
					{/*<Button variant="white" onPress={() => setHeading(0)}>*/}
					{/*	heading = 0° Север*/}
					{/*</Button>*/}
					{/*<Button variant="white" onPress={() => setHeading(90)}>*/}
					{/*	heading = 90° Восток*/}
					{/*</Button>*/}
					{/*<Button variant="white" onPress={() => setHeading(180)}>*/}
					{/*	heading = 180° Юг*/}
					{/*</Button>*/}
					{/*<Button variant="white" onPress={() => setHeading(270)}>*/}
					{/*	heading = 270° Запад*/}
					{/*</Button>*/}
					{state.isWorkoutStarted ? (
						<WorkoutStarted
							userLocations={state.myLocations}
							handleClickPause={handleClickPause}
							handleClickEndWorkout={handleClickEndWorkout}
							isPaused={state.isPaused}
							markerPosition={markerPosition}
							accuracy={accuracy}
							speedMPS={speedMPS}
							altitude={altitude}
							heading={heading}
							mapCenter={mapCenter}
						/>
					) : (
						<NewWorkout
							markerPosition={markerPosition}
							accuracy={accuracy}
							heading={heading}
							allPermsGranted={allPermissionsGrantedCallback}
							handleClickStart={handleClickStart}
							handleChangeWorkout={handleChangeWorkout}
							chosenWorkout={state.chosenWorkout}
							WorkoutTypesData={WorkoutTypesData}
							permissionsRef={permissionsRef}
						/>
					)}
				</SafeAreaView>
			</GestureHandlerRootView>
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative'
	}
})
