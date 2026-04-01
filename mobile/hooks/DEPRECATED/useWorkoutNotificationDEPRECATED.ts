// import { useCallback, useEffect, useRef } from 'react'
// import { PermissionsAndroid, Platform } from 'react-native'
// import * as Notification from 'expo-notifications'
// import { getWorkoutMeta, IWorkoutMeta } from '@/store/workoutStorage'
// import { formatTime } from '@/helpers/formatTime'
// import notifee, {
// 	AndroidForegroundServiceType,
// 	AndroidImportance,
// 	AndroidVisibility,
// 	EventType
// } from '@notifee/react-native'
//
// interface NotificationActions {
// 	handleClickPause: () => Promise<void>
// }
//
// interface UseWorkoutNotificationReturn {
// 	startNotificationTimer: (userId?: string) => Promise<void>
// 	stopNotificationTimer: () => Promise<void>
// }
//
// export const useWorkoutNotification = (actions: NotificationActions): UseWorkoutNotificationReturn => {
// 	const notificationIntervalRef = useRef<null | ReturnType<typeof setInterval>>(null)
//
// 	useEffect(() => {
// 		return notifee.onForegroundEvent(async ({ type, detail }) => {
// 			if (type === EventType.ACTION_PRESS) {
// 				if (!detail.pressAction) return
// 				if (detail.pressAction.id === 'pause') await actions.handleClickPause()
// 				if (detail.pressAction.id === 'resume') await actions.handleClickPause()
// 			}
// 		})
// 	}, [actions])
//
// 	const createChannel = async () => {
// 		await notifee.createChannel({
// 			id: 'workout',
// 			name: 'Отслеживание тренировки',
// 			importance: AndroidImportance.LOW
// 		})
// 	}
//
// 	const startNotificationTimer = async (userId?: string) => {
// 		if (Platform.OS !== 'android') return
// 		if (notificationIntervalRef.current) return
// 		const { granted: notificationsGranted } = await Notification.getPermissionsAsync()
// 		const activityRecognitionPerms = await PermissionsAndroid.request(
// 			PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION
// 		)
//
// 		if (activityRecognitionPerms !== PermissionsAndroid.RESULTS.GRANTED || !notificationsGranted) return
// 		await createChannel()
//
// 		const meta = getWorkoutMeta(userId)
// 		if (!meta) {
// 			console.log('Нет активной тренировки, уведомления не запускаются')
// 			return
// 		}
//
// 		notificationIntervalRef.current = setInterval(() => {
// 			const meta = getWorkoutMeta(userId)
//
// 			if (!meta) {
// 				if (notificationIntervalRef.current) {
// 					clearInterval(notificationIntervalRef.current)
// 					notificationIntervalRef.current = null
// 				}
// 				return console.warn('Нет активной тренировки для показа уведомления')
// 			}
//
// 			updateNotification(meta)
// 		}, 1000)
// 	}
//
// 	const updateNotification = async (meta: IWorkoutMeta) => {
// 		let actions = []
//
// 		if (meta.isPaused) {
// 			actions = [{ title: 'Продолжить', pressAction: { id: 'resume' } }]
// 		} else {
// 			actions = [{ title: 'Пауза', pressAction: { id: 'pause' } }]
// 		}
//
// 		let elapsed
// 		if (meta.isPaused && meta.lastPauseAt) {
// 			elapsed = meta.lastPauseAt - meta.startedAt - meta.totalPausedMs
// 		} else {
// 			elapsed = Date.now() - meta.startedAt - meta.totalPausedMs
// 		}
//
// 		const formatted = formatTime(elapsed)
// 		await notifee.displayNotification({
// 			id: 'workout-timer',
// 			title: 'Тренировка',
// 			body: formatted,
// 			android: {
// 				channelId: 'workout',
// 				asForegroundService: true,
// 				autoCancel: false,
// 				foregroundServiceTypes: [AndroidForegroundServiceType.FOREGROUND_SERVICE_TYPE_HEALTH],
// 				importance: AndroidImportance.LOW,
// 				// showChronometer: true, @TODO
// 				// chronometerDirection: 'up',
// 				// timestamp: meta.startedAt,
// 				ongoing: true,
// 				visibility: AndroidVisibility.PUBLIC,
// 				pressAction: {
// 					id: 'default'
// 					// launchActivity: '', // @TODO?
// 					// launchActivityFlags: [],
// 					// mainComponent: ''
// 				},
// 				actions: actions
// 			}
// 		})
// 	}
//
// 	const stopNotificationTimer = useCallback(async () => {
// 		await notifee.stopForegroundService()
// 		if (notificationIntervalRef.current) {
// 			clearInterval(notificationIntervalRef.current)
// 			notificationIntervalRef.current = null
// 		}
// 	}, [])
//
// 	return {
// 		startNotificationTimer,
// 		stopNotificationTimer
// 	}
// }
