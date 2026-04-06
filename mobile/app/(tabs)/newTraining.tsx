import { AppState } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import WorkoutStarted from '@/components/training/WorkoutStarted'
import NewWorkout, { IWorkoutModeElement } from '@/components/training/NewWorkout'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import {
	clearActiveWorkoutData,
	getShortWorkouts,
	getUnsavedWorkoutsThatHaveId,
	getWorkoutMeta,
	IWorkoutMeta,
	moveActiveWorkoutToNotSaved,
	moveActiveWorkoutToShortWorkouts,
	removeAllShortWorkouts,
	setActiveWorkoutPauseState,
	setWorkoutItems,
	startAndStoreNewActiveWorkout
} from '@/store/workoutStorage'
import { useRouter } from 'expo-router'
import { AllGeolocationPermissionsHandle } from '@/components/AllGeolocationPermissions'
import { debounce } from '@/helpers/debounce'
import { throttle } from '@/helpers/throttle'
import { initializeBackgroundLocationTask, isTrackingLocation, startTracking } from '@/hooks/track-location/track'
import { useLocationData, useLocationTracking } from '@/hooks/track-location'
import { updateMapSettings } from '@/store/mapStorage'
import { deleteNotFinishedTraining, deleteNotFinishedTrainingById, startTraining } from '@/api/workout'
import { randomHexColor } from '@/helpers/randomHexColor'
import { isWorkoutTooShort } from '@/helpers/isWorkoutTooShort'
import { useInternetConnectionRef } from '@/hooks/useInternetConnectionRef'
import { formatTime } from '@/helpers/formatTime'
import { calculateCalories } from '@/helpers/calculateCalories'
import { calculatePace } from '@/helpers/calculatePace'
import { getWorkoutHeight } from '@/helpers/getWorkoutHeight'
import { useWorkoutResultsAfterFinishStore } from '@/store/workoutResultsAfterFinishStore'
import { formatDistance } from '@/helpers/distance'
import { WorkoutTypesData } from '@/constants/WorkoutTypes'
import { TrainingType } from '@shared/enums'
import { useAuthStore } from '@/store/authStore'
import { VIEWWORKOUT_MODE } from '@/app/training/viewWorkout'
import { Colors } from '@/constants/Colors'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { ERRORS } from '@shared/errors'
import BlurProvider from '@/components/providers/BlurProvider'
import { saveSingleWorkout, WorkoutSource } from '@/helpers/saveUnsavedTraining'
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
// initializeNotifications(promise)
initializeBackgroundLocationTask(promise)

const HEADING_THROTTLE_MS = 750
const PAUSE_DEBOUNCE_MS = 300
const INITIAL_MAP_ZOOM = 14

export default function NewTraining() {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const { user } = useAuthStore()
	const { setTrainingId, setStartedAt, setType, setPoints, setMetrics } = useWorkoutResultsAfterFinishStore()

	const router = useRouter()
	const permissionsRef = useRef<AllGeolocationPermissionsHandle>(null)
	const headingSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const activeLocationSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const isInternetConnectedRef = useInternetConnectionRef()

	const [chosenWorkout, setChosenWorkout] = useState<IWorkoutModeElement>(WorkoutTypesData[0])
	// Добавляем флаг ожидания старта после получения прав
	const isPendingStartRef = useRef(false) // флаг, который отвечает за ожидание запуска тренировки (пока permissions !== granted)
	const isPendingActiveTrackingRef = useRef(false) // флаг, который отвечает за ожидание запуска трекинга позиции в активном режиме (пока permissions !== granted)

	const onInitialDataLoaded = useCallback((restoredType?: TrainingType) => {
		if (restoredType) {
			// Ищем объект тренировки по типу
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
		// let isPhysicalActivityPermissionGranted = false // DEPRECATED notifee
		// let isNotificationsGranted = false

		// DEPRECATED notifee
		// if (Platform.OS === 'android') {
		// 	const { granted: notificationsGranted } = await Notification.getPermissionsAsync() // Пока что уведомления нужны только для android
		// 	isNotificationsGranted = notificationsGranted
		// 	isPhysicalActivityPermissionGranted = await PermissionsAndroid.check(
		// 		PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
		// 	)
		// }

		return {
			foregroundStatus,
			backgroundStatus,
			isGPSEnabled
			// isPhysicalActivityPermissionGranted,
			// isNotificationsGranted
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
		const shortWorkouts = getShortWorkouts(user?.id)
		const isShortWorkoutsExist = shortWorkouts.length

		if (isInternetConnectedRef.current && isShortWorkoutsExist) {
			try {
				const result = await deleteNotFinishedTraining()
				if (result.success) {
					removeAllShortWorkouts(user?.id) // (storage)
				}
			} catch (e) {
				console.log('Ошибка deleteNotFinishedTraining', e)
			}
		}

		const {
			foregroundStatus,
			backgroundStatus,
			isGPSEnabled
			// isPhysicalActivityPermissionGranted, // DEPRECATED notifee
			// isNotificationsGranted
		} = await checkPermissions()

		const hasLocationPermissions = foregroundStatus?.granted && backgroundStatus?.granted && isGPSEnabled

		// DEPRECATED notifee
		// const hasAndroidExtras = Platform.OS === 'android' ? isNotificationsGranted && isPhysicalActivityPermissionGranted : true // на iOS просто true

		// Если мы восстанавливаемся после ребута, мы предполагаем, что права уже есть.
		// Если их нет, мы не можем молча упасть, лучше показать ошибку, но можно сделать проверку мягче.
		if (!hasLocationPermissions /* || !hasAndroidExtras*/) {
			if (!afterReboot) {
				// Устанавливаем флаг, что мы пытались начать тренировку
				isPendingStartRef.current = true
				// toast.error('Невозможно начать тренировку без предоставления всех разрешений') // Убрал тост, чтобы не мешал модалкам
			}
			return permissionsRef.current?.checkPermissions()
		}

		isPendingStartRef.current = false // сбрасываем, когда начинаем тренировку

		if (!afterReboot) {
			let newTrainingId = null

			if (isInternetConnectedRef.current) {
				try {
					const newTraining = await startTraining({ type: workoutType, colorHex: randomHexColor() })
					newTrainingId = newTraining.id
				} catch (e: unknown) {
					console.log('(1) [start-workout-error]:', e)
					await getFieldsErrors(e)
					// Если человек не закончил предыдущую тренировку, то следующую невозможно начать
					// @TODO Восстановление/удаление тренировки
					if (typeof e === 'object' && e !== null && 'response' in e) {
						const response = (e as any).response
						const errors = await response.json()
						if (errors?.message === ERRORS.USER_IN_NOT_FINISHED_TRAINING) {
							return
						}
						if (
							errors?.message === ERRORS.USER_IS_TRAINING_PARTICIPANT ||
							errors?.message === ERRORS.USER_IS_NOT_TRAINING_PARTICIPANT
						) {
							return
						}
					}
				}
			} else {
				toast.info('Нет подключения к интернету, тренировка будет происходить в оффлайн режиме')
			}

			setIsWorkoutStarted(true)
			startAndStoreNewActiveWorkout(workoutType, newTrainingId, user?.id)
			acceptLivePointsRef.current = true // включаем live точки сразу после старта
		}

		stopActiveTracking()
		await startHeadingTracking()
		return startTrackingLocation()
	}

	const handleClickStart = useCallback(
		(afterReboot: boolean) => {
			startWorkout(chosenWorkout.type, afterReboot)
		},
		[chosenWorkout.type]
	)

	const handleChangeWorkout = useCallback((workoutType: TrainingType) => {
		const foundedWorkout = WorkoutTypesData.find((workout) => workout.type === workoutType)
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
		const meta = getWorkoutMeta(user?.id)
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
				setActiveWorkoutPauseState(nextPauseState, user?.id)
				return nextPauseState
			})
			// Fix: Используем последнюю позицию из маршрута, если это доступно.
			// Это убирает прыгание к "Настоящей GPS" позиции, когда мы используем моковый маршрут.
			if (pointsRef.current.length > 0) {
				const lastPoint = pointsRef.current[pointsRef.current.length - 1]
				setWorkoutItems([lastPoint.locationObject], user?.id)
			} else {
				const lastUserPosition = await getLastUserPosition()
				setWorkoutItems([lastUserPosition], user?.id) // save pause position
			}
		} catch (e) {
			console.log('handleClickPause error:', e)
		}
	}, [])

	const pauseDebounced = useCallback(debounce(handleClickPause, PAUSE_DEBOUNCE_MS), [])

	const calculateMetricsWhenFinished = (meta: IWorkoutMeta | null | void) => {
		if (!meta) return

		// Время
		let timeElapsed = 0 // в миллисекундах
		if (meta) {
			if (meta.isPaused && meta.lastPauseAt) {
				timeElapsed = meta.lastPauseAt - meta.startedAt - meta.totalPausedMs
			} else {
				timeElapsed = Date.now() - meta.startedAt - meta.totalPausedMs
			}
		}

		// Ср. скорость
		let avgKmh = 0

		if (timeElapsed > 0) {
			avgKmh = (accumulatedDistanceRef.current * 3600) / timeElapsed // distance(m) → km/h
		}

		if (!Number.isFinite(avgKmh) || avgKmh < 0) avgKmh = 0

		const totalAvgSpeed = Math.round(avgKmh) + 'км/ч'
		const totalTimeFormatted = formatTime(timeElapsed)
		const totalCalories = calculateCalories(timeElapsed, accumulatedDistanceRef.current, chosenWorkout.type, 70) // @TODO вес пользователя
		const totalDistanceFormatted = formatDistance(accumulatedDistanceRef.current)
		const totalAvgPace = calculatePace(timeElapsed, accumulatedDistanceRef.current)
		const totalHeight = getWorkoutHeight(pointsRef.current)

		setTrainingId(meta.id)
		setStartedAt(meta.startedAt)
		setType(chosenWorkout)
		setPoints(pointsRef.current)
		return setMetrics({
			totalAvgSpeed,
			totalTimeFormatted,
			totalCalories,
			totalDistanceFormatted,
			totalAvgPace,
			totalHeight
		})
	}

	// Догрузка незавершенных тренировок на бэк
	const saveUnsavedWorkoutsBeforeFinish = async () => {
		const createdWorkouts = getUnsavedWorkoutsThatHaveId(user?.id)

		for (const w of createdWorkouts) {
			try {
				await saveSingleWorkout(WorkoutSource.UNSAVED, w.startedAt, user?.id)
			} catch (e) {
				console.error('[sync-before-finish] failed:', e)
			}
		}
	}

	const handleClickEndWorkout = useCallback(async () => {
		try {
			await tracking.stopTracking()

			if (headingSubscriptionRef.current) {
				headingSubscriptionRef.current.remove()
				headingSubscriptionRef.current = null
			}

			const meta = getWorkoutMeta(user?.id)
			calculateMetricsWhenFinished(meta)

			// Если завершил рано
			if (isWorkoutTooShort(user?.id)) {
				toast.info('Тренировка завершена слишком рано')
				if (isInternetConnectedRef.current && meta?.id) {
					// тренировка существует на бэкенде
					const result = await deleteNotFinishedTrainingById(meta.id)
					if (result.success) {
						// удаление сразу
						clearActiveWorkoutData(user?.id)
						return resetWorkoutState()
					}
				} else if (!meta?.id) {
					// тренировка не существует на бэкенде
					// удаление сразу
					clearActiveWorkoutData(user?.id)
					return resetWorkoutState()
				} else if (!isInternetConnectedRef.current && meta?.id) {
					// нет интернета, но тренировка существует на бэкенде
					// для последующего удаления с фронта и бэкенда
					moveActiveWorkoutToShortWorkouts(user?.id)
					return resetWorkoutState()
				}
			}

			if (isInternetConnectedRef.current && meta) {
				// 1. сначала догружаем старые
				await saveUnsavedWorkoutsBeforeFinish()
				// 2. затем текущую активную
				await saveSingleWorkout(WorkoutSource.ACTIVE, meta.startedAt, user?.id)
			} else {
				toast.info('Нет доступа к интернету, тренировку можно будет сохранить позже')
				moveActiveWorkoutToNotSaved(user?.id)
			}
			// Полный сброс состояния карты и переменных
			resetWorkoutState()
			router.push(`/training/viewWorkout?mode=${VIEWWORKOUT_MODE.VIEW}&unsavedStartedAt=${meta?.startedAt}`)
		} catch (e: unknown) {
			console.error('handleClickEndWorkout error: ', e)
			await getFieldsErrors(e)
		}
	}, [chosenWorkout.type, user?.id, isInternetConnectedRef, resetWorkoutState, router, toast, tracking])

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, backgroundColor: Colors['black-0d'] }}>
			<BlurProvider>
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
			</BlurProvider>
		</SafeAreaProvider>
	)
}
