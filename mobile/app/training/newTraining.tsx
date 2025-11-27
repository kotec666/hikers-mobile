import { PermissionsAndroid, Platform, StyleSheet, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import WorkoutRunning from '@/components/svg/WorkoutRunning'
import WorkoutWalking from '@/components/svg/WorkoutWalking'
import WorkoutBicycle from '@/components/svg/WorkoutBicycle'
import { useToast } from '@/hooks/useToast'
import WorkoutStarted from '@/components/training/WorkoutStarted'
import NewWorkout, { IWorkoutModeElement } from '@/components/training/NewWorkout'
import * as Notification from 'expo-notifications'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import {
	moveActiveWorkoutToNotSaved,
	setActiveWorkoutPauseState,
	setWorkoutItems,
	startAndStoreNewActiveWorkout
} from '@/store/workoutStorage'
import { useRouter } from 'expo-router'
import { initializeNotifications } from '@/helpers/notifications'
import { AllGeolocationPermissionsHandle } from '@/components/AllGeolocationPermissions'
import { TrainingType } from '../../../shared/enums'
import { debounce } from '@/helpers/debounce'
import { throttle } from '@/helpers/throttle'
import { useWorkoutNotification } from '@/hooks/useWorkoutNotification'
import { initializeBackgroundLocationTask } from '@/hooks/track-location/track'
import { useLocationData, useLocationTracking } from '@/hooks/track-location'

// Debugging
TaskManager.getRegisteredTasksAsync().then((tasks) => {
	console.log(tasks)
})

// Declare a variable to store the resolver function
let resolver: (() => void) | null

// Create a promise and store its resolve function for later
const promise = new Promise<void>((resolve) => {
	resolver = resolve
})

// Pass the promise to the background task, it will wait until the promise resolves
initializeNotifications(promise)
initializeBackgroundLocationTask(promise)

const WorkoutTypesData = [
	{ id: 1, type: TrainingType.RUN, name: 'Забег', IconComponent: WorkoutRunning },
	{ id: 2, type: TrainingType.RUN, name: 'Ходьба', IconComponent: WorkoutWalking },
	{ id: 3, type: TrainingType.BICYCLE, name: 'Велосипед last', IconComponent: WorkoutBicycle }
]

const HEADING_THROTTLE_MS = 750
const PAUSE_DEBOUNCE_MS = 300

export default function NewTraining() {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const router = useRouter()
	const permissionsRef = useRef<AllGeolocationPermissionsHandle>(null)
	const headingSubscriptionRef = useRef<null | Location.LocationSubscription>(null)

	const [chosenWorkout, setChosenWorkout] = useState<IWorkoutModeElement>(WorkoutTypesData[0])

	const onInitialDataLoaded = useCallback(() => {
		handleClickStart(true)
	}, [])

	const {
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
		setIsWorkoutStarted,
		setIsPaused
	} = useLocationData(resolver, onInitialDataLoaded, chosenWorkout.type)

	const tracking = useLocationTracking()
	// const distance = useLocationDistance(locations)

	// @TODO так не использовать, отдельно вынести пермишны
	// useEffect(() => {
	// 	if (permissionsRef.current) {
	// 		permissionsRef.current.checkPermissions() или здесь asInitialCheck: true
	// 	}
	// }, [])

	// @TODO сделать на хуках
	// useTrainingLifecycle()
	// useLocationTracking()
	// useHeadingTracking()
	// useTrainingRestore()
	// useTrainingPermissions()
	// useRestoreWorkout({
	// 	setIsWorkoutStarted, setIsPaused, setChosenWorkout, myLocationsRef, ... после рестарта (перезахода в) приложения (-е)
	// })

	const startTrackingLocation = async () => {
		try {
			// Запуск отслеживания foreground + background
			await tracking.startTracking()
		} catch (e) {
			console.error('Ошибка запуска отслеживания:', e)
			toast.error('Ошибка запуска отслеживания местоположения')
		}
	}

	const throttledHeadingUpdate = throttle((data: Location.LocationHeadingObject) => {
		userLocationMarkerRef.current?.setMarkerHeading(data.trueHeading ?? data.magHeading)
		// setHeadingDebug(data.trueHeading ?? data.magHeading)
	}, HEADING_THROTTLE_MS)

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
		// @TODO здесь нет фильтра по accuracy > ACCURACY_THRESHOLD
		return await Location.getCurrentPositionAsync()
	}

	const startWorkout = async (workoutType: TrainingType, afterReboot: boolean) => {
		try {
			const {
				foregroundStatus,
				backgroundStatus,
				isGPSEnabled,
				isPhysicalActivityPermissionGranted,
				isNotificationsGranted
			} = await checkPermissions()

			const hasLocationPermissions = foregroundStatus?.granted && backgroundStatus?.granted && isGPSEnabled

			const hasAndroidExtras =
				Platform.OS === 'android' ? isNotificationsGranted && isPhysicalActivityPermissionGranted : true // на iOS просто true

			if (!hasLocationPermissions || !hasAndroidExtras) {
				toast.error('Невозможно начать тренировку без предоставления всех разрешений')
				return permissionsRef.current?.checkPermissions()
			}
			setIsWorkoutStarted(true)

			if (!afterReboot) {
				startAndStoreNewActiveWorkout(workoutType)
				console.log('chosenWorkout', workoutType)
			}

			await startHeadingTracking()
			if (isNotificationsGranted && isPhysicalActivityPermissionGranted) {
				await startNotificationTimer() // опционально, если уведомления разрешены
			}

			return startTrackingLocation()
		} catch (error) {
			console.error('Ошибка при старте тренировки:', error)
			toast.error('Произошла ошибка при запуске тренировки')
		}
	}

	const handleClickStart = useCallback(
		(afterReboot: boolean) => {
			startWorkout(chosenWorkout.type, afterReboot)
		},
		[chosenWorkout.type]
	)

	const handleChangeWorkout = useCallback((workoutId: number) => {
		const foundedWorkout = WorkoutTypesData.find((workout) => workout.id === workoutId)
		if (!foundedWorkout) return
		setChosenWorkout(foundedWorkout)
	}, [])

	const allPermissionsGrantedCallback = useCallback(async () => {
		console.log('allPermissionsGrantedCallback')
		const { newLatLon, lastUserPosition } = await getFastUserPositionAndSetAsInitial()

		if (mapComponentRef.current) {
			mapComponentRef.current.setMapCenter(newLatLon, 0.5, 13)
		}
		if (userLocationMarkerRef.current && lastUserPosition) {
			userLocationMarkerRef.current.setAccuracy(lastUserPosition.coords.accuracy)
			userLocationMarkerRef.current.setMarkerHeading(lastUserPosition.coords.heading)
			userLocationMarkerRef.current.setMarkerPosition(newLatLon)
		}
	}, [])

	const handleClickPause = useCallback(async () => {
		console.log('handleClickPause')
		try {
			metricSpeedRef.current?.setSpeed(0)
			setIsPaused((prevState) => {
				const nextPauseState = !prevState
				setActiveWorkoutPauseState(nextPauseState)
				return nextPauseState
			})
			const lastUserPosition = await getLastUserPosition()
			setWorkoutItems([lastUserPosition]) // save pause position
		} catch (e) {
			console.log('handleClickPause error:', e)
		}
	}, [])

	const { startNotificationTimer, stopNotificationTimer } = useWorkoutNotification({
		handleClickPause
	})

	const getFastUserPositionAndSetAsInitial = async () => {
		// @TODO не должно работать, когда нет разрешений
		try {
			const lastUserPosition = await getFastUserPosition()
			const newLatLon = {
				lat: lastUserPosition.coords.latitude,
				lon: lastUserPosition.coords.longitude
			}

			if (!initialMarkerLocationSetRef.current) {
				initialMarkerLocationSetRef.current = true
				setInitialMarkerLocationState(newLatLon)
			}

			return {
				newLatLon,
				lastUserPosition
			}
		} catch (e) {
			console.warn('getFastUserPositionAndSetAsInitial: нет разрешений', e)
			return { newLatLon: null, lastUserPosition: null }
		}
	}

	useEffect(() => {
		getFastUserPositionAndSetAsInitial()
	}, [])

	const pauseDebounced = useCallback(debounce(handleClickPause, PAUSE_DEBOUNCE_MS), [])

	const handleClickEndWorkout = useCallback(async () => {
		// @TODO требуется проверка на то что тренировка завершилась слишком рано
		try {
			router.push('/training/viewWorkout')
			await tracking.stopTracking()

			if (headingSubscriptionRef.current) {
				headingSubscriptionRef.current.remove()
				headingSubscriptionRef.current = null
			}
			moveActiveWorkoutToNotSaved()
			await stopNotificationTimer()
			setIsWorkoutStarted(false)
			setIsPaused(false)
			initialMarkerLocationSetRef.current = false
			pointsRef.current = []
		} catch (e) {
			console.error('handleClickEndWorkout error: ', e)
		}
	}, [])

	console.log('render NewTraining')

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<View style={styles.container}>
					{isWorkoutStarted ? (
						<WorkoutStarted
							initialMarkerLocation={initialMarkerLocationState}
							handleClickPause={pauseDebounced}
							handleClickEndWorkout={handleClickEndWorkout}
							workoutType={chosenWorkout.type}
							isPaused={isPaused}
							initialLocationsState={initialLocationsState}
							userLocationMarkerRef={userLocationMarkerRef}
							mapComponentRef={mapComponentRef}
							metricSpeedRef={metricSpeedRef}
							metricDistanceRef={metricDistanceRef}
							metricCaloriesRef={metricCaloriesRef}
							metricHeightRef={metricHeightRef}
							accumulatedDistanceRef={accumulatedDistanceRef} // Для темпа
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
				</View>
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
