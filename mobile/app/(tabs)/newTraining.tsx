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
	clearActiveWorkoutData,
	getActiveWorkoutPoints,
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
import { finishTraining, startTraining, syncTraining } from '@/api/workout'
import { randomHexColor } from '@/helpers/randomHexColor'
import { prepareLocationsForSync } from '@/helpers/prepareLocationsForSync'
import * as Network from 'expo-network'
import { deserializeGetterType } from '@/helpers/binarySerializer'
import { isWorkoutTooShort } from '@/helpers/isWorkoutTooShort'

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
	{ id: 1, type: TrainingType.WALK, name: 'Ходьба', IconComponent: WorkoutWalking },
	{ id: 2, type: TrainingType.RUN, name: 'Забег', IconComponent: WorkoutRunning },
	{ id: 3, type: TrainingType.BICYCLE, name: 'Велосипед last', IconComponent: WorkoutBicycle }
]

const HEADING_THROTTLE_MS = 750
const PAUSE_DEBOUNCE_MS = 300
const INITIAL_MAP_ZOOM = 14

export default function NewTraining() {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const router = useRouter()
	const permissionsRef = useRef<AllGeolocationPermissionsHandle>(null)
	const headingSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const activeLocationSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const networkState = Network.useNetworkState()
	const hasInternet = networkState.isInternetReachable === true

	const [chosenWorkout, setChosenWorkout] = useState<IWorkoutModeElement>(WorkoutTypesData[0])
	// Добавляем флаг ожидания старта после получения прав
	const isPendingStartRef = useRef(false) // флаг, который отвечает за ожидание запуска тренировки (пока permissions !== granted)
	const isPendingActiveTrackingRef = useRef(false) // флаг, который отвечает за ожидание запуска трекинга позиции в активном режиме (пока permissions !== granted)

	const onInitialDataLoaded = useCallback((restoredType?: TrainingType) => {
		if (restoredType) {
			// Ищем объект тренировки по типу (можно улучшить поиск по ID, если он сохраняется)
			const found = WorkoutTypesData.find((w) => w.type === restoredType)
			if (found) {
				setChosenWorkout(found)
			}
		}

		handleClickStart(true)
	}, [])

	const tracking = useLocationTracking()

	const {
		mapComponentRef,
		userLocationMarkerRef,
		latestUserMarkerLocationRef,
		metricAvgSpeedRef,
		metricSpeedRef,
		metricDistanceRef,
		metricCaloriesRef,
		metricHeightRef,
		accumulatedDistanceRef,
		pointsRef,
		acceptLivePointsRef,
		initialMarkerLocationState,
		initialLocationsState,
		isWorkoutStarted,
		isPaused,
		resetWorkoutState,
		saveInitialMarkerLocation,
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

	const startHeadingTracking = useCallback(async () => {
		headingSubscriptionRef.current = await Location.watchHeadingAsync(throttledHeadingUpdate)
	}, [throttledHeadingUpdate])

	const startActiveTracking = useCallback(async () => {
		if (activeLocationSubscriptionRef.current) return // уже запущено

		console.log('[active-tracking] starting active location tracking...')
		try {
			activeLocationSubscriptionRef.current = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.Balanced,
					distanceInterval: 1
				},
				(location) => {
					console.log('[active-tracking] received active location: ', location)
					const { latitude: lat, longitude: lon, accuracy } = location.coords
					saveInitialMarkerLocation({ lat, lon })
					mapComponentRef.current?.setMapCenter({ lat, lon })
					userLocationMarkerRef.current?.setMarkerPosition({ lat, lon })
					latestUserMarkerLocationRef.current = { lat, lon }
					userLocationMarkerRef.current?.setAccuracy(accuracy)
				}
			)
		} catch (e) {
			console.log('[active-tracking] error:', e)
		}
	}, [latestUserMarkerLocationRef, mapComponentRef, saveInitialMarkerLocation, userLocationMarkerRef])

	const stopActiveTracking = useCallback(() => {
		if (activeLocationSubscriptionRef.current) {
			activeLocationSubscriptionRef.current.remove()
			activeLocationSubscriptionRef.current = null
		}
	}, [])

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

		const last = await Location.getLastKnownPositionAsync({
			maxAge: 0
		})
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
				let newTrainingId = null
				try {
					const newTraining = await startTraining({ type: workoutType, colorHex: randomHexColor() })
					newTrainingId = newTraining.id
				} catch (e) {
					console.log('[start-workout-error]:', e)
					newTrainingId = null
				}
				startAndStoreNewActiveWorkout(workoutType, newTrainingId)
				acceptLivePointsRef.current = true // включаем live точки сразу после старта
			}

			stopActiveTracking()
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
			mapComponentRef.current.setMapCenter({ lat, lon }, 0.5, INITIAL_MAP_ZOOM)
			updateMapSettings({
				lat: lat,
				lon: lon,
				zoom: INITIAL_MAP_ZOOM
			})
		}
		if (userLocationMarkerRef.current) {
			userLocationMarkerRef.current.setAccuracy(accuracy)
			userLocationMarkerRef.current.setMarkerHeading(heading)
			userLocationMarkerRef.current.setMarkerPosition({ lat, lon })
		}
	}, [mapComponentRef, userLocationMarkerRef])

	const allPermissionsGrantedCallback = useCallback(async () => {
		// Если висит флаг ожидания старта - запускаем тренировку автоматически
		if (isPendingStartRef.current) {
			await getFastUserPosAndSetWithCenter()
			return startWorkout(chosenWorkout.type, false)
		}
		if (isPendingActiveTrackingRef.current) {
			startActiveTracking()
			startHeadingTracking()
			isPendingActiveTrackingRef.current = false
		}
	}, [chosenWorkout.type, getFastUserPosAndSetWithCenter])

	useEffect(() => {
		const meta = getWorkoutMeta()
		// Если нет мета - значит тренировка не активна, можно запускать трекинг в активном режиме
		if (!meta) {
			isPendingActiveTrackingRef.current = true
			permissionsRef.current?.checkPermissions()
		}

		return () => {
			stopActiveTracking()
		}
	}, [stopActiveTracking])

	const handleClickPause = useCallback(async () => {
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
		try {
			// @TODO требуется проверка на то что тренировка завершилась слишком рано и что происходит
			if (isWorkoutTooShort()) {
				toast.info('Тренировка завершена слишком рано')
				return clearActiveWorkoutData()
			}

			if (hasInternet) {
				router.push('/training/viewWorkout')
			} else {
				router.push('/profile')
			}
			await tracking.stopTracking()

			if (headingSubscriptionRef.current) {
				headingSubscriptionRef.current.remove()
				headingSubscriptionRef.current = null
			}
			await stopNotificationTimer()
			// Полный сброс состояния карты и переменных
			resetWorkoutState()

			// Догрузка несохраненных точек
			if (hasInternet) {
				const meta = getWorkoutMeta()
				const unsavedPoints = getActiveWorkoutPoints(deserializeGetterType.NOT_SAVED)

				if (meta?.id) {
					// Тренировка существует на бэкенде
					if (unsavedPoints.length) {
						const preparedLocations = prepareLocationsForSync(unsavedPoints)
						await syncTraining(meta.id, preparedLocations)
					}
				} else {
					// Тренировка не существует на бэкенде
					const newTraining = await startTraining({
						type: chosenWorkout.type,
						colorHex: randomHexColor(),
						ts: meta?.startedAt
					})
					if (unsavedPoints.length) {
						const preparedLocations = prepareLocationsForSync(unsavedPoints)
						await syncTraining(newTraining.id, preparedLocations)
					}
				}

				try {
					await finishTraining()
					clearActiveWorkoutData()
				} catch {}
			} else {
				toast.info('Нет доступа к интернету, тренировку можно будет сохранить позже')
				moveActiveWorkoutToNotSaved()
			}
		} catch (e) {
			console.error('handleClickEndWorkout error: ', e)
		}
	}, [chosenWorkout.type, hasInternet, resetWorkoutState, router, stopNotificationTimer, toast, tracking])

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			{/*<GestureHandlerRootView style={{ flex: 1 }}>*/}
			<View style={styles.container}>
				{isWorkoutStarted ? (
					<WorkoutStarted
						handleClickPause={pauseDebounced}
						handleClickEndWorkout={handleClickEndWorkout}
						workoutType={chosenWorkout.type}
						isPaused={isPaused}
						mapComponentRef={mapComponentRef}
						metricAvgSpeedRef={metricAvgSpeedRef}
						metricSpeedRef={metricSpeedRef}
						metricDistanceRef={metricDistanceRef}
						metricCaloriesRef={metricCaloriesRef}
						metricHeightRef={metricHeightRef}
						accumulatedDistanceRef={accumulatedDistanceRef} // Для темпа
						initialLocationsState={initialLocationsState}
						userLocationMarkerRef={userLocationMarkerRef}
						initialMarkerLocation={initialMarkerLocationState}
						latestUserMarkerLocationRef={latestUserMarkerLocationRef}
					/>
				) : (
					<NewWorkout
						userLocationMarkerRef={userLocationMarkerRef}
						initialMarkerLocation={initialMarkerLocationState}
						latestUserMarkerLocationRef={latestUserMarkerLocationRef}
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
			{/*</GestureHandlerRootView>*/}
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative'
	}
})
