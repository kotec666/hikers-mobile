import { AppState, PermissionsAndroid, Platform, StyleSheet, View } from 'react-native'
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
	getWorkoutMeta,
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
import { initializeBackgroundLocationTask, isTrackingLocation, startTracking } from '@/hooks/track-location/track'
import { useLocationData, useLocationTracking } from '@/hooks/track-location'
import { updateMapSettings } from '@/store/mapStorage'

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
	// Добавляем флаг ожидания старта после получения прав
	const isPendingStartRef = useRef(false) // флаг, который отвечает за ожидание запуска тренировки (пока permissions !== granted)

	const onInitialDataLoaded = useCallback((restoredType?: TrainingType) => {
		if (restoredType) {
			// Ищем объект тренировки по типу (можно улучшить поиск по ID, если он сохраняется)
			const found = WorkoutTypesData.find((w) => w.type === restoredType)
			if (found) {
				console.log('[restore] Restoring workout type:', found.name)
				setChosenWorkout(found)
			}
		}

		handleClickStart(true)
	}, [])

	const tracking = useLocationTracking()

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
		resetWorkoutState,
		setInitialMarkerLocationState,
		setIsWorkoutStarted,
		setIsPaused
	} = useLocationData(resolver, onInitialDataLoaded, chosenWorkout.type)

	// Watchdog: если тренировка активна, проверяем, жив ли сервис локации.
	// Если телефон был перезагружен, isTrackingLocation() вернет false, но isWorkoutStarted будет true.
	useEffect(() => {
		if (!isWorkoutStarted || isPaused) return

		const checkAndReviveTracking = async () => {
			try {
				const isRunning = await isTrackingLocation()
				if (!isRunning) {
					console.warn('[watchdog] Tracking is not running for active workout. Restarting...')
					await startTracking()
				}
			} catch (e) {
				console.error('[watchdog] Failed to check/restart tracking', e)
			}
		}

		// Проверяем сразу при монтировании (например, после открытия приложения после ребута)
		checkAndReviveTracking()

		// И можно проверять при возвращении приложения из фона в активное состояние
		const sub = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'active') {
				checkAndReviveTracking()
			}
		})

		return () => sub.remove()
	}, [isWorkoutStarted, isPaused])

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

	const getFastUserPosition = async () => {
		const foregroundStatus = await Location.getForegroundPermissionsAsync()
		if (!foregroundStatus.granted) return null

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

			// Если мы восстанавливаемся после ребута, мы предполагаем, что права уже есть.
			// Если их нет, мы не можем молча упасть, лучше показать ошибку, но можно сделать проверку мягче.
			if (!hasLocationPermissions || !hasAndroidExtras) {
				if (!afterReboot) {
					// Устанавливаем флаг, что мы пытались начать тренировку
					isPendingStartRef.current = true
					// toast.error('Невозможно начать тренировку без предоставления всех разрешений') // Убрал тост, чтобы не мешал модалкам
				}
				return permissionsRef.current?.checkPermissions()
			}
			setIsWorkoutStarted(true)
			isPendingStartRef.current = false // сбрасываем, когда начинаем тренировку

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

	const getFastUserPosAndSetWithCenter = useCallback(async () => {
		const locationObject = await getFastUserPosition()
		if (!locationObject) return
		const {
			coords: { latitude: lat, longitude: lon, accuracy, heading }
		} = locationObject

		setInitialMarkerLocationState({ lat, lon })
		if (mapComponentRef.current) {
			mapComponentRef.current.setMapCenter({ lat, lon }, 0.5, 16)
			updateMapSettings({
				lat: lat,
				lon: lon,
				zoom: 16
			})
		}
		if (userLocationMarkerRef.current) {
			userLocationMarkerRef.current.setAccuracy(accuracy)
			userLocationMarkerRef.current.setMarkerHeading(heading)
			userLocationMarkerRef.current.setMarkerPosition({ lat, lon })
		}
	}, [mapComponentRef, userLocationMarkerRef])

	useEffect(() => {
		// если не в тренировке, то установит локацию - карта + метка
		const meta = getWorkoutMeta()
		if (!meta) {
			getFastUserPosAndSetWithCenter()
		}
	}, [getFastUserPosAndSetWithCenter])

	const allPermissionsGrantedCallback = useCallback(async () => {
		console.log('allPermissionsGrantedCallback')

		// Если висит флаг ожидания старта - запускаем тренировку автоматически
		if (isPendingStartRef.current) {
			await getFastUserPosAndSetWithCenter()
			return startWorkout(chosenWorkout.type, false)
		}
	}, [chosenWorkout.type, getFastUserPosAndSetWithCenter])

	const handleClickPause = useCallback(async () => {
		console.log('handleClickPause')
		try {
			metricSpeedRef.current?.setSpeed(0)
			setIsPaused((prevState) => {
				const nextPauseState = !prevState
				setActiveWorkoutPauseState(nextPauseState)
				return nextPauseState
			})
			// Fix: Используем последнюю позицию из маршрута, если это доступно.
			// Это убирает прыгание к "Настоящей GPS" позиции, когда мы используем моковый маршрут.
			if (pointsRef.current.length > 0) {
				const lastPoint = pointsRef.current[pointsRef.current.length - 1]
				setWorkoutItems([lastPoint.locationObject])
			} else {
				const lastUserPosition = await getLastUserPosition()
				setWorkoutItems([lastUserPosition]) // save pause position
			}
		} catch (e) {
			console.log('handleClickPause error:', e)
		}
	}, [])

	const { startNotificationTimer, stopNotificationTimer } = useWorkoutNotification({
		handleClickPause
	})

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
			// Полный сброс состояния карты и переменных
			resetWorkoutState()
		} catch (e) {
			console.error('handleClickEndWorkout error: ', e)
		}
	}, [resetWorkoutState, stopNotificationTimer, tracking])

	console.log('render NewTraining')

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<GestureHandlerRootView style={{ flex: 1 }}>
				<View style={styles.container}>
					{isWorkoutStarted ? (
						<WorkoutStarted
							handleClickPause={pauseDebounced}
							handleClickEndWorkout={handleClickEndWorkout}
							workoutType={chosenWorkout.type}
							isPaused={isPaused}
							mapComponentRef={mapComponentRef}
							metricSpeedRef={metricSpeedRef}
							metricDistanceRef={metricDistanceRef}
							metricCaloriesRef={metricCaloriesRef}
							metricHeightRef={metricHeightRef}
							accumulatedDistanceRef={accumulatedDistanceRef} // Для темпа
							initialLocationsState={initialLocationsState}
							initialMarkerLocation={initialMarkerLocationState}
							userLocationMarkerRef={userLocationMarkerRef}
						/>
					) : (
						<NewWorkout
							initialMarkerLocation={initialMarkerLocationState}
							userLocationMarkerRef={userLocationMarkerRef}
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
