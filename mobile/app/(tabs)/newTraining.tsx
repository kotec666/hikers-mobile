import { AppState, Platform } from 'react-native'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useToast } from '@/hooks/useToast'
import WorkoutStarted from '@/components/training/WorkoutStarted'
import NewWorkout, { IWorkoutModeElement, NewWorkoutHandle } from '@/components/training/NewWorkout'
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'
import {
	clearActiveWorkoutData,
	getShortWorkouts,
	getUnsavedWorkoutsThatHaveId,
	getWorkoutDistanceMeters,
	getWorkoutMeta,
	IWorkoutMeta,
	moveActiveWorkoutToNotSaved,
	moveActiveWorkoutToShortWorkouts,
	removeAllShortWorkouts,
	setActiveWorkoutPauseState,
	setWorkoutItems,
	startAndStoreNewActiveWorkout
} from '@/store/workoutStorage'
import { useFocusEffect, useRouter } from 'expo-router'
import { AllGeolocationPermissionsHandle } from '@/components/AllGeolocationPermissions'
import { debounce } from '@/helpers/debounce'
import { throttle } from '@/helpers/throttle'
import { initializeBackgroundLocationTask, isTrackingLocation, startTracking } from '@/hooks/track-location/track'
import { useLocationData, useLocationTracking } from '@/hooks/track-location'
import { updateYaMapSettings } from '@/store/yaMapStorage'
import { deleteNotFinishedTraining, deleteNotFinishedTrainingById, startTraining } from '@/api/workout'
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
import { VIEW_WORKOUT_MODE } from '@/app/training/viewWorkout'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { ERRORS } from '@shared/errors'
import BlurProvider from '@/components/providers/BlurProvider'
import { saveSingleWorkout, WorkoutSource } from '@/helpers/saveUnsavedTraining'
import EndTrainingModal from '@/components/training/EndTrainingModal'
import { calculateAverageSpeedKmh, getWorkoutElapsedMs } from '@/helpers/workoutMetrics'
import { autoFinishActiveWorkout, isWorkoutDueForAutoFinish, type AutoFinishResult } from '@/helpers/workoutAutoFinish'
import {
	cancelWorkoutAutoFinishNotifications,
	requestWorkoutAutoFinishNotificationPermission,
	scheduleWorkoutAutoFinishNotifications
} from '@/services/workoutAutoFinishNotifications'
import { restoreWorkoutLiveActivity } from '@/hooks/track-location/liveActivityMetrics'
import {
	addWorkoutLiveActivityWidgetActionListener,
	consumePendingWorkoutLiveActivityAction,
	endWorkoutLiveActivity,
	pauseWorkoutLiveActivity,
	resumeWorkoutLiveActivity,
	startWorkoutLiveActivity
} from '@/hooks/track-location/liveActivity'
import type { PendingWidgetAction } from '@/modules/expo-live-activity'
import { useFinishWorkoutMutation } from '@/queries/workout'
import { Page } from '@/components/ui/Page'
import { RNMapAnimationType } from '@/types/mapAnimationType'
import { updateRNMapSettings } from '@/store/rnMapStorage'
import { useTranslation } from 'react-i18next'
// Debugging
TaskManager.getRegisteredTasksAsync().then((tasks) => {
	console.log('getRegisteredTasksAsync', tasks)
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
const YA_MAP_INITIAL_MAP_ZOOM = 14
const RN_MAP_INITIAL_MAP_ZOOM = 500
const FINISH_CLEANUP_TIMEOUT_MS = 5000
const AUTO_FINISH_POLL_MS = 10 * 1000

const withTimeout = (promise: Promise<unknown>, ms: number, label: string): Promise<unknown> =>
	Promise.race([
		promise,
		new Promise<void>((resolve) =>
			setTimeout(() => {
				console.warn(`[end-workout] ${label} timed out after ${ms}ms`)
				resolve()
			}, ms)
		)
	])

export default function NewTraining() {
	const { t, i18n } = useTranslation()
	const toast = useToast()
	const { user } = useAuthStore()
	const isIOS = Platform.OS === 'ios'
	const { setTrainingId, setStartedAt, setType, setPoints, setMetrics } = useWorkoutResultsAfterFinishStore()

	const router = useRouter()
	const permissionsRef = useRef<AllGeolocationPermissionsHandle>(null)
	const toggleBottomSheetOnNewWorkoutRef = useRef<NewWorkoutHandle>(null)
	const headingSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const activeLocationSubscriptionRef = useRef<null | Location.LocationSubscription>(null)
	const isScreenFocusedRef = useRef(false)
	const isInternetConnectedRef = useInternetConnectionRef()
	const { mutateAsync: finishWorkout } = useFinishWorkoutMutation()

	const [chosenWorkout, setChosenWorkout] = useState<IWorkoutModeElement>(WorkoutTypesData[0])
	const [isEndTrainingModalOpen, setIsEndTrainingModalOpen] = useState(false)
	const handleClickStartRef = useRef<(afterReboot: boolean, workoutTypeOverride?: TrainingType) => void>(() => {})
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

		handleClickStartRef.current(true, restoredType)
	}, [])

	const tracking = useLocationTracking()

	const {
		rnMapComponentRef,
		rnMapUserLocationMarkerRef,
		yaMapComponentRef,
		yaMapUserLocationMarkerRef,
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

	const setWorkoutPauseState = useCallback(
		(nextPauseState: boolean) => {
			if (!user?.id) return

			if (nextPauseState) {
				metricSpeedRef.current?.setSpeed(0)
			}

			setActiveWorkoutPauseState(nextPauseState, user.id)
			setIsPaused(nextPauseState)
		},
		[metricSpeedRef, setIsPaused, user]
	)

	const handleCloseEndModal = useCallback(() => {
		setIsEndTrainingModalOpen(false)
	}, [])

	const handleClickOpenEndModal = useCallback(() => {
		setIsEndTrainingModalOpen(true)
	}, [])

	const handleWorkoutLiveActivityAction = useCallback(
		(event: PendingWidgetAction | null) => {
			if (!event || !user?.id || !getWorkoutMeta(user.id)) return

			if (event.action === 'pause') {
				setWorkoutPauseState(true)
				return
			}

			if (event.action === 'resume') {
				setWorkoutPauseState(false)
				return
			}

			// Нажатие завершения в live activity
			handleClickOpenEndModal()
		},
		[handleClickOpenEndModal, setWorkoutPauseState, user]
	)

	useEffect(() => {
		const syncPendingWidgetAction = () => {
			handleWorkoutLiveActivityAction(consumePendingWorkoutLiveActivityAction())
		}

		syncPendingWidgetAction()

		const widgetActionSubscription = addWorkoutLiveActivityWidgetActionListener(handleWorkoutLiveActivityAction)
		const appStateSubscription = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'active') {
				syncPendingWidgetAction()
			}
		})

		return () => {
			widgetActionSubscription.remove()
			appStateSubscription.remove()
		}
	}, [handleWorkoutLiveActivityAction])

	// Watchdog: если тренировка активна, проверяем, жив ли сервис локации.
	// Если телефон был перезагружен, isTrackingLocation() вернет false, но isWorkoutStarted будет true.
	useEffect(() => {
		if (!isWorkoutStarted || isPaused) return

		const checkAndReviveTracking = async () => {
			try {
				// Если активная тренировка уже завершена (мета удалена) или истёк дедлайн
				// автозавершения — сервис локации не перезапускаем.
				const meta = getWorkoutMeta(user?.id)
				if (!meta || isWorkoutDueForAutoFinish(meta)) return

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
	}, [isWorkoutStarted, isPaused, user?.id])

	const startTrackingLocation = useCallback(async () => {
		try {
			// Запуск отслеживания foreground + background
			await tracking.startTracking()
		} catch (e) {
			console.error('Ошибка запуска отслеживания:', e)

			toast.error(t('ToastMessage.error.startingLocationTracking'))
		}
	}, [t, toast, tracking])

	const throttledHeadingUpdate = useMemo(
		() =>
			// eslint-disable-next-line react-hooks/refs -- throttle оборачивает функцию, рефы читаются при вызове колбэка, не при рендере
			throttle((data: Location.LocationHeadingObject) => {
				if (isIOS) {
					rnMapUserLocationMarkerRef.current?.setMarkerHeading(data.trueHeading ?? data.magHeading)
				} else {
					yaMapUserLocationMarkerRef.current?.setMarkerHeading(data.trueHeading ?? data.magHeading)
				}
			}, HEADING_THROTTLE_MS),
		[yaMapUserLocationMarkerRef, rnMapUserLocationMarkerRef, isIOS]
	)

	const startHeadingTracking = useCallback(async () => {
		if (headingSubscriptionRef.current) return

		headingSubscriptionRef.current = await Location.watchHeadingAsync(throttledHeadingUpdate)
	}, [throttledHeadingUpdate])

	const stopHeadingTracking = useCallback(() => {
		if (headingSubscriptionRef.current) {
			headingSubscriptionRef.current.remove()
			headingSubscriptionRef.current = null
		}
	}, [])

	const startActiveTracking = useCallback(async () => {
		if (activeLocationSubscriptionRef.current) return // уже запущено

		console.log('[active-tracking] starting active location tracking...')
		try {
			activeLocationSubscriptionRef.current = await Location.watchPositionAsync(
				{
					accuracy: Location.Accuracy.BestForNavigation,
					timeInterval: 1000,
					distanceInterval: 1
				},
				(location) => {
					console.log('[active-tracking] received active location: ', location)
					const { latitude: lat, longitude: lon, accuracy, speed } = location.coords
					const markerMoveOptions = { speedMps: speed, timestamp: location.timestamp }
					saveInitialMarkerLocation({ lat, lon })
					if (isIOS) {
						rnMapComponentRef.current?.setMapCenter({ center: { lat, lon } })
						rnMapUserLocationMarkerRef.current?.setMarkerPosition({ lat, lon })
						rnMapUserLocationMarkerRef.current?.setAccuracy(accuracy)
					} else {
						const durationMs = yaMapUserLocationMarkerRef.current?.setMarkerPosition(
							{ lat, lon },
							markerMoveOptions
						)
						if (durationMs !== null) {
							yaMapComponentRef.current?.setMapCenter(
								{ lat, lon },
								durationMs !== undefined ? durationMs / 1000 : undefined
							)
						}
						yaMapUserLocationMarkerRef.current?.setAccuracy(accuracy)
					}

					latestUserMarkerLocationRef.current = { lat, lon }
				}
			)
		} catch (e) {
			console.log('[active-tracking] error:', e)
		}
	}, [
		latestUserMarkerLocationRef,
		yaMapComponentRef,
		yaMapUserLocationMarkerRef,
		rnMapComponentRef,
		rnMapUserLocationMarkerRef,
		saveInitialMarkerLocation,
		isIOS
	])

	const stopActiveTracking = useCallback(() => {
		if (activeLocationSubscriptionRef.current) {
			console.log('[active-tracking] stopping active location tracking...')
			activeLocationSubscriptionRef.current.remove()
			activeLocationSubscriptionRef.current = null
		}
	}, [])

	const handleAutoFinishResult = useCallback(
		(result: AutoFinishResult) => {
			if (result === 'no-op') return

			if (result === 'finished') {
				toast.info(t('ToastMessage.info.workoutAutoFinished'))
			} else if (result === 'moved-to-unsaved') {
				toast.info(t('ToastMessage.info.workoutAutoFinishedNoInternet'))
			}

			// Тренировка завершена в фоне или при возврате в приложение — сбрасываем UI
			stopHeadingTracking()
			stopActiveTracking()
			void tracking.stopTracking()
			void endWorkoutLiveActivity()
			resetWorkoutState()
		},
		[toast, t, stopHeadingTracking, stopActiveTracking, tracking, resetWorkoutState]
	)

	const syncWorkoutWithAutoFinish = useCallback(async () => {
		const meta = getWorkoutMeta(user?.id)

		// Мета исчезла, а тренировка всё ещё «запущена» в UI — её завершила фоновая задача локации.
		if (!meta) {
			if (isWorkoutStarted) {
				stopHeadingTracking()
				stopActiveTracking()
				void tracking.stopTracking()
				void endWorkoutLiveActivity()
				resetWorkoutState()
			}
			return
		}

		if (isWorkoutDueForAutoFinish(meta)) {
			const result = await autoFinishActiveWorkout(user?.id)
			handleAutoFinishResult(result)
		}
	}, [
		user?.id,
		isWorkoutStarted,
		stopHeadingTracking,
		stopActiveTracking,
		tracking,
		resetWorkoutState,
		handleAutoFinishResult
	])

	// При возвращении приложения в foreground проверяем, не истёк ли дедлайн автозавершения.
	// (Пока трекинг жив, это делает и фоновая задача локации — здесь страховка на случай её остановки.)
	useEffect(() => {
		const sub = AppState.addEventListener('change', (nextAppState) => {
			if (nextAppState === 'active') {
				void syncWorkoutWithAutoFinish()
			}
		})

		return () => sub.remove()
	}, [syncWorkoutWithAutoFinish])

	// Опрос в foreground: фоновая задача может завершить тренировку, пока пользователь на экране.
	useEffect(() => {
		if (!isWorkoutStarted) return

		const interval = setInterval(() => {
			void syncWorkoutWithAutoFinish()
		}, AUTO_FINISH_POLL_MS)

		return () => clearInterval(interval)
	}, [isWorkoutStarted, syncWorkoutWithAutoFinish])

	const checkPermissions = useCallback(async () => {
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
	}, [])

	const getFastUserPosition = useCallback(async () => {
		const foregroundStatus = await Location.getForegroundPermissionsAsync()
		if (!foregroundStatus.granted) return null

		const last = await Location.getLastKnownPositionAsync({
			maxAge: 0
		})
		if (last) return last

		return await Location.getCurrentPositionAsync({
			accuracy: Location.Accuracy.Low
		})
	}, [])

	const getLastUserPosition = useCallback(async (): Promise<Location.LocationObject> => {
		console.log('getLastUserPosition')
		// @TODO здесь нет фильтра по accuracy > ACCURACY_THRESHOLD
		return await Location.getCurrentPositionAsync()
	}, [])

	const startWorkout = useCallback(
		async (workoutType: TrainingType, afterReboot: boolean) => {
			// Автозавершение по истечении N (например, холодный старт, когда дедлайн уже прошёл)
			const activeMeta = getWorkoutMeta(user?.id)
			if (activeMeta && isWorkoutDueForAutoFinish(activeMeta)) {
				const result = await autoFinishActiveWorkout(user?.id)
				handleAutoFinishResult(result)
				return
			}

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
				}
				return permissionsRef.current?.checkPermissions()
			}

			isPendingStartRef.current = false // сбрасываем, когда начинаем тренировку

			if (!afterReboot) {
				let newTrainingId = null

				if (isInternetConnectedRef.current) {
					try {
						const newTraining = await startTraining({ type: workoutType })
						newTrainingId = newTraining.id
					} catch (e: unknown) {
						console.log('(1) [start-workout-error]:', e)
						await getFieldsErrors(e, t)
						// Если человек не закончил предыдущую тренировку, то следующую невозможно начать
						// @TODO Восстановление/удаление тренировки
						if (typeof e === 'object' && e !== null && 'response' in e) {
							const response = (e as any).response
							const errors = await response.json()
							if (errors?.message === ERRORS.USER_IN_NOT_FINISHED_TRAINING) {
								return toggleBottomSheetOnNewWorkoutRef.current?.toggleBottomSheetOnNewWorkout()
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
					toast.info(t('ToastMessage.info.noInternetConnectionTrainingWillTakePlaceOffline'))
				}

				setIsWorkoutStarted(true)
				startAndStoreNewActiveWorkout(workoutType, newTrainingId, user?.id)
				acceptLivePointsRef.current = true // включаем live точки сразу после старта

				// Планируем локальные уведомления о предупреждении и автозавершении
				const startedAt = getWorkoutMeta(user?.id)?.startedAt
				if (startedAt) {
					void requestWorkoutAutoFinishNotificationPermission().then((granted) => {
						if (granted) void scheduleWorkoutAutoFinishNotifications(startedAt)
					})
				}
			}

			if (afterReboot) {
				await restoreWorkoutLiveActivity(workoutType, user?.id)
			} else {
				await startWorkoutLiveActivity(workoutType)
			}

			stopActiveTracking()
			await startHeadingTracking()
			return startTrackingLocation()
		},
		[
			acceptLivePointsRef,
			checkPermissions,
			handleAutoFinishResult,
			isInternetConnectedRef,
			setIsWorkoutStarted,
			startHeadingTracking,
			startTrackingLocation,
			stopActiveTracking,
			t,
			toast,
			user
		]
	)

	const handleClickStart = useCallback(
		(afterReboot: boolean, workoutTypeOverride?: TrainingType) => {
			void startWorkout(workoutTypeOverride ?? chosenWorkout.type, afterReboot)
		},
		[chosenWorkout.type, startWorkout]
	)

	useEffect(() => {
		handleClickStartRef.current = handleClickStart
	}, [handleClickStart])

	const handleChangeWorkout = useCallback((workoutType: TrainingType) => {
		const foundedWorkout = WorkoutTypesData.find((workout) => workout.type === workoutType)
		if (!foundedWorkout) return
		setChosenWorkout(foundedWorkout)
	}, [])

	const getFastUserPosAndSetWithCenter = useCallback(async () => {
		const locationObject = await getFastUserPosition()
		if (!locationObject) return
		const {
			coords: { latitude: lat, longitude: lon, accuracy, heading },
			timestamp
		} = locationObject
		const markerMoveOptions = { immediate: true, timestamp }

		setInitialMarkerLocationState({ lat, lon })
		if (isIOS) {
			if (rnMapComponentRef.current) {
				rnMapComponentRef.current.setMapCenter({
					center: { lat, lon },
					animationType: RNMapAnimationType.LINEAR,
					zoomInMeters: 500
				})
				updateRNMapSettings({
					center: {
						latitude: lat,
						longitude: lon
					},
					altitude: RN_MAP_INITIAL_MAP_ZOOM
				})
			}
		} else {
			if (yaMapComponentRef.current) {
				yaMapComponentRef.current.setMapCenter({ lat, lon }, 0.5, YA_MAP_INITIAL_MAP_ZOOM)
				updateYaMapSettings({
					lat: lat,
					lon: lon,
					zoom: YA_MAP_INITIAL_MAP_ZOOM
				})
			}
		}

		if (isIOS) {
			if (rnMapUserLocationMarkerRef.current) {
				rnMapUserLocationMarkerRef.current.setAccuracy(accuracy)
				rnMapUserLocationMarkerRef.current.setMarkerHeading(heading)
				rnMapUserLocationMarkerRef.current.setMarkerPosition({ lat, lon })
			}
		} else {
			if (yaMapUserLocationMarkerRef.current) {
				yaMapUserLocationMarkerRef.current.setAccuracy(accuracy)
				yaMapUserLocationMarkerRef.current.setMarkerHeading(heading)
				yaMapUserLocationMarkerRef.current.setMarkerPosition({ lat, lon }, markerMoveOptions)
			}
		}
	}, [
		getFastUserPosition,
		setInitialMarkerLocationState,
		yaMapComponentRef,
		yaMapUserLocationMarkerRef,
		rnMapComponentRef,
		rnMapUserLocationMarkerRef,
		isIOS
	])

	const allPermissionsGrantedCallback = useCallback(async () => {
		// Если висит флаг ожидания старта - запускаем тренировку автоматически
		if (isPendingStartRef.current) {
			await getFastUserPosAndSetWithCenter()
			return startWorkout(chosenWorkout.type, false)
		}
		if (isPendingActiveTrackingRef.current) {
			const meta = getWorkoutMeta(user?.id)
			if (!isScreenFocusedRef.current || meta || isWorkoutStarted) return

			startActiveTracking()
			startHeadingTracking()
			isPendingActiveTrackingRef.current = false
		}
	}, [
		chosenWorkout.type,
		getFastUserPosAndSetWithCenter,
		isWorkoutStarted,
		startActiveTracking,
		startHeadingTracking,
		startWorkout,
		user?.id
	])

	useFocusEffect(
		useCallback(() => {
			isScreenFocusedRef.current = true

			const meta = getWorkoutMeta(user?.id)
			// Если нет мета - значит тренировка не активна, можно запускать трекинг в активном режиме
			if (!meta && !isWorkoutStarted) {
				isPendingActiveTrackingRef.current = true
				permissionsRef.current?.checkPermissions()
			}

			return () => {
				isScreenFocusedRef.current = false
				isPendingActiveTrackingRef.current = false
				stopActiveTracking()

				if (!getWorkoutMeta(user?.id)) {
					stopHeadingTracking()
				}
			}
		}, [isWorkoutStarted, stopActiveTracking, stopHeadingTracking, user?.id])
	)

	const handleClickPause = useCallback(async () => {
		try {
			const nextPauseState = !isPaused
			setWorkoutPauseState(nextPauseState)
			if (nextPauseState) {
				void pauseWorkoutLiveActivity()
			} else {
				void resumeWorkoutLiveActivity()
			}
			// Fix: Используем последнюю позицию из маршрута, если это доступно.
			// Это убирает прыгание к "Настоящей GPS" позиции, когда мы используем моковый маршрут.
			if (pointsRef.current.length > 0) {
				const lastPoint = pointsRef.current[pointsRef.current.length - 1]
				const savedPoints = setWorkoutItems([{ ...lastPoint.locationObject, timestamp: Date.now() }], user?.id)
				pointsRef.current.push(...savedPoints)
			} else {
				const lastUserPosition = await getLastUserPosition()
				const savedPoints = setWorkoutItems([{ ...lastUserPosition, timestamp: Date.now() }], user?.id)
				pointsRef.current.push(...savedPoints)
			}
		} catch (e) {
			console.log('handleClickPause error:', e)
		}
	}, [getLastUserPosition, isPaused, pointsRef, setWorkoutPauseState, user])

	// eslint-disable-next-line react-hooks/refs -- debounce оборачивает функцию, handleClickPause вызывается позже, не при рендере
	const pauseDebounced = useMemo(() => debounce(handleClickPause, PAUSE_DEBOUNCE_MS), [handleClickPause])

	const calculateMetricsWhenFinished = useCallback(
		(meta: IWorkoutMeta | null | void) => {
			if (!meta) return

			// Время
			const timeElapsed = getWorkoutElapsedMs(meta)
			const distanceMeters = getWorkoutDistanceMeters(user?.id)

			// Ср. скорость
			const avgKmh = calculateAverageSpeedKmh(distanceMeters, timeElapsed)

			const totalAvgSpeed = Math.round(avgKmh) + t('measurementUnits.kmh')
			const totalTimeFormatted = formatTime(timeElapsed)
			const totalCalories = calculateCalories(timeElapsed, distanceMeters, chosenWorkout.type, 70) // @TODO вес пользователя
			const totalDistanceFormatted = formatDistance(distanceMeters, i18n.language)
			const totalAvgPace = calculatePace(timeElapsed, distanceMeters)
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
		},
		[
			chosenWorkout,
			i18n.language,
			pointsRef,
			setMetrics,
			setPoints,
			setStartedAt,
			setTrainingId,
			setType,
			t,
			user?.id
		]
	)

	// Догрузка незавершенных тренировок на бэк
	const saveUnsavedWorkoutsBeforeFinish = useCallback(async () => {
		const createdWorkouts = getUnsavedWorkoutsThatHaveId(user?.id)

		for (const w of createdWorkouts) {
			try {
				await saveSingleWorkout(WorkoutSource.UNSAVED, w.startedAt, finishWorkout, user?.id)
			} catch (e) {
				console.error('[sync-before-finish] failed:', e)
			}
		}
	}, [user, finishWorkout])

	const handleClickEndWorkout = useCallback(async () => {
		try {
			await withTimeout(tracking.stopTracking(), FINISH_CLEANUP_TIMEOUT_MS, 'stopTracking')
			await withTimeout(endWorkoutLiveActivity(), FINISH_CLEANUP_TIMEOUT_MS, 'endLiveActivity')

			stopHeadingTracking()

			const meta = getWorkoutMeta(user?.id)
			if (meta?.startedAt) void cancelWorkoutAutoFinishNotifications(meta.startedAt)
			calculateMetricsWhenFinished(meta)

			// Если завершил рано
			if (isWorkoutTooShort(user?.id)) {
				toast.info(t('ToastMessage.info.trainingEndedTooEarly'))
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
				const newTrainingId = await saveSingleWorkout(
					WorkoutSource.ACTIVE,
					meta.startedAt,
					finishWorkout,
					user?.id
				)
				setTrainingId(newTrainingId)
			} else {
				toast.info(t('ToastMessage.info.noInternetTheWorkoutCanBeSavedLater'))
				moveActiveWorkoutToNotSaved(user?.id)
			}
			// Полный сброс состояния карты и переменных
			resetWorkoutState()
			router.push(`/training/viewWorkout?mode=${VIEW_WORKOUT_MODE.VIEW}&unsavedStartedAt=${meta?.startedAt}`)
		} catch (e: unknown) {
			console.error('handleClickEndWorkout error: ', e)
			await getFieldsErrors(e, t)
		}
	}, [
		tracking,
		stopHeadingTracking,
		user,
		calculateMetricsWhenFinished,
		isInternetConnectedRef,
		resetWorkoutState,
		router,
		toast,
		saveUnsavedWorkoutsBeforeFinish,
		finishWorkout,
		setTrainingId,
		t
	])

	const handleClickEnd = useCallback(() => {
		handleCloseEndModal()
		void handleClickEndWorkout()
	}, [handleClickEndWorkout, handleCloseEndModal])

	return (
		<Page edges={['top']}>
			<BlurProvider>
				<EndTrainingModal
					blurDisabled={Platform.OS === 'android'}
					open={isEndTrainingModalOpen}
					handleClose={handleCloseEndModal}
					handleClickEnd={handleClickEnd}
				/>
				{isWorkoutStarted ? (
					<WorkoutStarted
						handleClickPause={pauseDebounced}
						handleClickOpenEndModal={handleClickOpenEndModal}
						workoutType={chosenWorkout.type}
						isPaused={isPaused}
						yaMapComponentRef={yaMapComponentRef}
						yaMapUserLocationMarkerRef={yaMapUserLocationMarkerRef}
						rnMapComponentRef={rnMapComponentRef}
						rnMapUserLocationMarkerRef={rnMapUserLocationMarkerRef}
						metricAvgSpeedRef={metricAvgSpeedRef}
						metricSpeedRef={metricSpeedRef}
						metricDistanceRef={metricDistanceRef}
						metricCaloriesRef={metricCaloriesRef}
						metricHeightRef={metricHeightRef}
						accumulatedDistanceRef={accumulatedDistanceRef} // Для темпа
						initialLocationsState={initialLocationsState}
						initialMarkerLocation={initialMarkerLocationState}
						latestUserMarkerLocationRef={latestUserMarkerLocationRef}
					/>
				) : (
					<NewWorkout
						ref={toggleBottomSheetOnNewWorkoutRef}
						yaMapComponentRef={yaMapComponentRef}
						yaMapUserLocationMarkerRef={yaMapUserLocationMarkerRef}
						rnMapComponentRef={rnMapComponentRef}
						rnMapUserLocationMarkerRef={rnMapUserLocationMarkerRef}
						initialMarkerLocation={initialMarkerLocationState}
						latestUserMarkerLocationRef={latestUserMarkerLocationRef}
						allPermsGranted={allPermissionsGrantedCallback}
						handleClickStart={handleClickStart}
						handleChangeWorkout={handleChangeWorkout}
						chosenWorkout={chosenWorkout}
						WorkoutTypesData={WorkoutTypesData}
						permissionsRef={permissionsRef}
					/>
				)}
			</BlurProvider>
		</Page>
	)
}
