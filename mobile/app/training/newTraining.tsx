import { Text, PermissionsAndroid, Platform, SafeAreaView, StyleSheet, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import React, { useCallback, useEffect, useRef, useState } from 'react'
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
	getFullActiveWorkout,
	IWorkoutLocationStorageItem,
	moveActiveWorkoutToNotSaved,
	setActiveWorkoutPauseState,
	setWorkoutItem,
	startAndStoreNewActiveWorkout
} from '@/store/workoutStorage'
import { MapComponentHandle } from '@/components/map/MapComponent'
import { useRouter } from 'expo-router'
import { useLatest } from '@/hooks/useLatest'
import { initializeNotifications } from '@/helpers/notifications'
import { AllGeolocationPermissionsHandle } from '@/components/AllGeolocationPermissions'
import * as Notification from 'expo-notifications'
import { TrainingType } from '../../../shared/enums'
import { debounce } from '@/helpers/debounce'
import { throttle } from '@/helpers/throttle'
// eslint-disable-next-line import/no-duplicates
import '@/tasks/backgroundLocationHandler'
// eslint-disable-next-line import/no-duplicates
import { LOCATION_TASK_NAME } from '@/tasks/backgroundLocationHandler'
import { MetricSpeedHandle } from '@/components/training/tabs/metrics/MetricSpeed'
import { UserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/UserLocationMarker'
import { Point } from 'react-native-yamap-plus'
import { useWorkoutNotification } from '@/hooks/useWorkoutNotification'

initializeNotifications()

const WorkoutTypesData = [
	{ id: 1, type: TrainingType.RUN, name: 'Забег', IconComponent: WorkoutRunning },
	{ id: 2, type: TrainingType.RUN, name: 'Ходьба', IconComponent: WorkoutWalking },
	{ id: 3, type: TrainingType.BICYCLE, name: 'Велосипед last', IconComponent: WorkoutBicycle }
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
	const metricSpeedRef = useRef<MetricSpeedHandle>(null)
	const myLocationsRef = useRef<IWorkoutLocationStorageItem[]>([])
	const initialLocationSetRef = useRef(false)

	const [chosenWorkout, setChosenWorkout] = useState<IWorkoutModeElement>(WorkoutTypesData[0])
	const [isWorkoutStarted, setIsWorkoutStarted] = useState<boolean>(false)
	const [isPaused, setIsPaused] = useState<boolean>(false)
	const [initialMarkerLocationState, setInitialMarkerLocationState] = useState<Point | null>(null)
	// const [headingDebug, setHeadingDebug] = useState<number | null>(null)
	const isPausedRef = useLatest(isPaused)
	const [isReady, setIsReady] = useState(false)

	useEffect(() => {
		if (permissionsRef.current) {
			permissionsRef.current.checkPermissions()
		}
	}, [])

	useEffect(() => {
		// после рестарта (перезахода в) приложения (-е)
		let idleId: number | null = null

		const run = () => {
			const activeWorkout = getFullActiveWorkout()

			if (activeWorkout) {
				const foundedWorkout =
					WorkoutTypesData.find((w) => w.type === activeWorkout.type) ?? WorkoutTypesData[0]
				setIsPaused(activeWorkout.isPaused)

				setChosenWorkout(foundedWorkout)

				if (!initialLocationSetRef.current) {
					const lastKnownPosition = activeWorkout.locations.at(-1)
					if (lastKnownPosition) {
						initialLocationSetRef.current = true
						setInitialMarkerLocationState({
							lat: lastKnownPosition.locationObject.coords.latitude,
							lon: lastKnownPosition.locationObject.coords.longitude
						})
					}
				}
				handleClickStart(true)
			}

			// Загружаем локации
			if (activeWorkout?.locations) {
				myLocationsRef.current = activeWorkout.locations
			}

			setIsReady(true)
		}

		idleId = requestIdleCallback(run)

		return () => {
			if (idleId) cancelIdleCallback(idleId)
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
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

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

					if (userLocationMarkerRef.current) {
						userLocationMarkerRef.current.setMarkerPosition(newLatLon)
						userLocationMarkerRef.current.setAccuracy(location.coords.accuracy)
					}
					if (mapComponentRef.current) {
						if (!initialLocationSetRef.current) {
							initialLocationSetRef.current = true
							setInitialMarkerLocationState(newLatLon)
						}
						mapComponentRef.current.setMapCenter(newLatLon, 1.2)
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
	}, 750)

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
			setInitialMarkerLocationState(newLatLon)
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
		console.log('handleClickPause')
		metricSpeedRef.current?.setSpeed(0)
		setIsPaused((prevState) => {
			const nextPauseState = !prevState
			setActiveWorkoutPauseState(nextPauseState)
			return nextPauseState
		})
		const lastUserPosition = await getLastUserPosition()
		saveLocationToStorageAndState(lastUserPosition)
	}, [])

	const { startNotificationTimer, stopNotificationTimer } = useWorkoutNotification({
		handleClickPause
	})

	const pauseDebounced = useCallback(debounce(handleClickPause, 300), [])

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
		myLocationsRef.current = []
		if (userLocationMarkerRef.current) {
			userLocationMarkerRef.current.setAccuracy(null)
			userLocationMarkerRef.current.setMarkerPosition(null)
		}
	}, [])

	console.log('render NewTraining')

	if (!isReady) {
		return (
			<SafeAreaProvider style={{ paddingTop: insets.top }}>
				<View className="w-full grow items-center justify-center">
					<Text className="text-white">Загрузка...</Text>
				</View>
			</SafeAreaProvider>
		)
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<SafeAreaView style={styles.container}>
					{isWorkoutStarted ? (
						<WorkoutStarted
							// headingDebug={state.headingDebug}
							initialMarkerLocation={initialMarkerLocationState}
							// userLocations={myLocations}
							handleClickPause={pauseDebounced}
							handleClickEndWorkout={handleClickEndWorkout}
							workoutType={chosenWorkout.type}
							isPaused={isPaused}
							userLocations={myLocationsRef}
							userLocationMarkerRef={userLocationMarkerRef}
							metricSpeedRef={metricSpeedRef}
							mapComponentRef={mapComponentRef}
						/>
					) : (
						<NewWorkout
							userLocationMarkerRef={userLocationMarkerRef}
							initialMarkerLocation={initialMarkerLocationState}
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
