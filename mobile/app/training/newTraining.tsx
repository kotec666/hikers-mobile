import { PermissionsAndroid, Platform, SafeAreaView, StyleSheet } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
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
	startAndStoreNewActiveWorkout
} from '@/store/workoutStorage'
import { ILatLng, MapComponentHandle } from '@/components/map/MapComponent'
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
import { debounce } from '@/helpers/debounce'
import { UserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker'
import { throttle } from '@/helpers/throttle'

// eslint-disable-next-line import/no-duplicates
import '@/tasks/backgroundLocationHandler'
// eslint-disable-next-line import/no-duplicates
import { LOCATION_TASK_NAME } from '@/tasks/backgroundLocationHandler'
import { MetricSpeedHandle } from '@/components/training/tabs/metrics/MetricSpeed'

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

export default function NewTraining() {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const router = useRouter()
	const mapComponentRef = useRef<MapComponentHandle>(null)
	const userLocationMarkerRef = useRef<UserLocationMarkerHandle>(null)
	const permissionsRef = useRef<AllGeolocationPermissionsHandle>(null)
	const locationSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const headingSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const notificationIntervalRef = useRef<null | ReturnType<typeof setInterval>>(null)
	const metricSpeedRef = useRef<MetricSpeedHandle>(null)
	const myLocationsRef = useRef<IWorkoutLocationStorageItem[]>([])
	const initialLocationSetRef = useRef(false)

	const [chosenWorkout, setChosenWorkout] = useState<IWorkoutModeElement>(WorkoutTypesData[0])
	const [isWorkoutStarted, setIsWorkoutStarted] = useState<boolean>(false)
	const [isPaused, setIsPaused] = useState<boolean>(false)
	// const [myLocations, setMyLocations] = useState<IWorkoutLocationStorageItem[]>([])
	const [initialMarkerLocation, setInitialMarkerLocation] = useState<ILatLng | null>(null)
	// const [headingDebug, setHeadingDebug] = useState<number | null>(null)
	const isPausedRef = useLatest(isPaused)

	useEffect(() => {
		if (permissionsRef.current) {
			permissionsRef.current.checkPermissions()
		}
	}, [])

	useLayoutEffect(() => {
		// @TODO useLayoutEffect?
		// после рестарта (перезахода в) приложения (-е)
		const workoutStorage = getAllWorkoutStorage()
		const activeWorkout = workoutStorage.activeWorkout

		if (activeWorkout) {
			const foundedWorkout = WorkoutTypesData.find((w) => w.type === activeWorkout.type) ?? WorkoutTypesData[0]
			setIsPaused(activeWorkout.isPaused)
			// setMyLocations(activeWorkout.locations)
			myLocationsRef.current = activeWorkout.locations
			setChosenWorkout(foundedWorkout)
			handleClickStart(true)
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
		const lastSavedWorkoutItem = setWorkoutItem(location) // Сохраняем в локальное хранилище

		if (!lastSavedWorkoutItem) {
			return
		}

		const prevLocations = myLocationsRef.current
		if (prevLocations.length > 0) {
			const lastLoc = prevLocations[prevLocations.length - 1]
			// защита от дублирования
			if (lastLoc.relTs === lastSavedWorkoutItem.relTs) return
		}

		// Update Ref
		myLocationsRef.current.push(lastSavedWorkoutItem)

		// Imperatively update Map Path
		if (mapComponentRef.current) {
			mapComponentRef.current.updatePath(lastSavedWorkoutItem)
		}

		// setMyLocations((prevState) => {
		// 	const lastSavedWorkoutItem = setWorkoutItem(location) // Сохраняем в локальное хранилище
		//
		// 	if (!lastSavedWorkoutItem) {
		// 		// there was no active workout in storage — don't update state
		// 		return prevState
		// 	}
		// 	if (prevState?.find((loc) => loc.relTs === lastSavedWorkoutItem.relTs)) {
		// 		// защита от дублирования, если такая локация уже существует в локальном стейте
		// 		return prevState
		// 	}
		//
		// 	if (prevState.length) {
		// 		return [...prevState, lastSavedWorkoutItem]
		// 	} else {
		// 		return [lastSavedWorkoutItem]
		// 	}
		// })
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

					const newLatLon = {
						lat: location.coords.latitude,
						lon: location.coords.longitude
					}

					console.log('newLatLon', newLatLon)

					if (mapComponentRef.current) {
						if (!initialLocationSetRef.current) {
							initialLocationSetRef.current = true
							setInitialMarkerLocation(newLatLon)
						}
						// @TODO если впервые получили точку, то центр должен меняться мгновенно
						// @TODO или анимацию сделать линейной
						// @TODO если прервать анимацию центровки не получится, то можно попробовать отправить линейную анимацию с длительностью 0 сек...
						// mapComponentRef.current.setMapCenter(newLatLon, 1.2)
						// mapComponentRef.current.addPointsToLine(newLatLon)
					}
					if (userLocationMarkerRef.current) {
						userLocationMarkerRef.current.setMarkerPosition(newLatLon)
						userLocationMarkerRef.current.setAccuracy(location.coords.accuracy)
					}

					if (!isPausedRef.current) {
						metricSpeedRef?.current?.setSpeed(location.coords.speed ?? 0)
					}

					saveLocationToStorageAndState(location)
				}
			)
		} catch (e) {
			console.error('Ошибка запуска отслеживания:', e)
			toast.error('Ошибка запуска отслеживания местоположения')
		}
	}

	const throttledHeadingUpdate = throttle((data: Location.LocationHeadingObject) => {
		userLocationMarkerRef.current?.setMarkerHeading(data.trueHeading ?? data.magHeading)
	}, 500)

	const startHeadingTracking = async () => {
		headingSubscriptionRef.current = await Location.watchHeadingAsync(throttledHeadingUpdate)
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

	async function getFastUserPosition() {
		const last = await Location.getLastKnownPositionAsync()
		if (last) return last

		return await Location.getCurrentPositionAsync({
			accuracy: Location.Accuracy.Low
		})
	}

	const getLastUserPosition = async (): Promise<Location.LocationObject> => {
		console.log('getLastUserPosition')
		// @TODO здесь нет фильтра по accuracy > 50
		return await Location.getCurrentPositionAsync()
	}

	const handleClickStart = useCallback(
		async (afterReboot: boolean) => {
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
				setIsWorkoutStarted(true)

				if (!afterReboot) {
					startAndStoreNewActiveWorkout(chosenWorkout.type)
					console.log('chosenWorkout', chosenWorkout)
				}

				await startHeadingTracking()
				if (isNotificationsGranted && isPhysicalActivityPermissionGranted) {
					await startNotificationTimer() // опционально, если уведомления разрешены
				}

				return startTracking()
			} catch (error) {
				console.error('Ошибка при старте тренировки:', error)
				toast.error('Произошла ошибка при запуске тренировки')
			}
		},
		[chosenWorkout]
	)

	const handleChangeWorkout = useCallback((workoutId: number) => {
		const foundedWorkout = WorkoutTypesData.find((workout) => workout.id === workoutId)
		if (!foundedWorkout) return
		setChosenWorkout(foundedWorkout)
	}, [])

	const allPermissionsGrantedCallback = useCallback(async () => {
		console.log('allPermissionsGrantedCallback')
		const lastUserPosition = await getFastUserPosition()
		const newLatLon = {
			lat: lastUserPosition.coords.latitude,
			lon: lastUserPosition.coords.longitude
		}

		if (!initialLocationSetRef.current) {
			initialLocationSetRef.current = true
			setInitialMarkerLocation(newLatLon)
		}
		if (mapComponentRef.current) {
			mapComponentRef.current.setMapCenter(newLatLon, 0.5, 13)
		}
		if (userLocationMarkerRef.current) {
			userLocationMarkerRef.current.setAccuracy(lastUserPosition.coords.accuracy)
			userLocationMarkerRef.current.setMarkerHeading(lastUserPosition.coords.heading)
			userLocationMarkerRef.current.setMarkerPosition(newLatLon)
		}
	}, [])

	const handleClickPause = useCallback(async () => {
		metricSpeedRef.current?.setSpeed(0)
		setIsPaused((prevState) => {
			const nextPauseState = !prevState
			setActiveWorkoutPauseState(nextPauseState)
			return nextPauseState
		})
		const lastUserPosition = await getLastUserPosition()
		saveLocationToStorageAndState(lastUserPosition)
	}, [])

	const pauseDebounced = useCallback(debounce(handleClickPause, 300), [])

	const stopNotificationTimer = async () => {
		await notifee.stopForegroundService()
		if (notificationIntervalRef.current) {
			clearInterval(notificationIntervalRef.current)
			notificationIntervalRef.current = null
		}
	}

	const handleClickEndWorkout = useCallback(async () => {
		// @TODO требуется проверка на то что тренировка завершилась слишком рано
		router.push('/training/viewWorkout')

		const lastUserPosition = await getLastUserPosition()
		await stopBackgroundTracking()

		if (locationSubscriptionRef.current) {
			locationSubscriptionRef.current.remove()
			locationSubscriptionRef.current = null
		}
		if (headingSubscriptionRef.current) {
			headingSubscriptionRef.current.remove()
			headingSubscriptionRef.current = null
		}
		saveLocationToStorageAndState(lastUserPosition)
		moveActiveWorkoutToNotSaved()
		await stopNotificationTimer()
		setIsWorkoutStarted(false)
		setIsPaused(false)
		initialLocationSetRef.current = false
		// setMyLocations([])
		myLocationsRef.current = []
		if (userLocationMarkerRef.current) {
			userLocationMarkerRef.current.setAccuracy(null)
			userLocationMarkerRef.current.setMarkerPosition(null)
		}
	}, [])

	const loadAndSetSavedLocations = () => {
		const WorkoutStorage = getAllWorkoutStorage()

		const locations = WorkoutStorage.activeWorkout?.locations

		if (locations) {
			// setMyLocations(locations)
			myLocationsRef.current = locations
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
			if (mapComponentRef.current) {
				mapComponentRef.current = null
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
		if (Platform.OS !== 'android') return
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

	console.log('render NewTraining')
	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaView style={styles.container}>
					{isWorkoutStarted ? (
						<WorkoutStarted
							// headingDebug={state.headingDebug}
							initialMarkerLocation={initialMarkerLocation}
							// userLocations={myLocations}
							handleClickPause={pauseDebounced}
							handleClickEndWorkout={handleClickEndWorkout}
							workoutType={chosenWorkout.type}
							isPaused={isPaused}
							userLocations={myLocationsRef.current}
							userLocationMarkerRef={userLocationMarkerRef}
							metricSpeedRef={metricSpeedRef}
							mapComponentRef={mapComponentRef}
						/>
					) : (
						<NewWorkout
							userLocationMarkerRef={userLocationMarkerRef}
							initialMarkerLocation={initialMarkerLocation}
							allPermsGranted={allPermissionsGrantedCallback}
							handleClickStart={handleClickStart}
							handleChangeWorkout={handleChangeWorkout}
							chosenWorkout={chosenWorkout}
							WorkoutTypesData={WorkoutTypesData}
							permissionsRef={permissionsRef}
							mapComponentRef={mapComponentRef}
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
