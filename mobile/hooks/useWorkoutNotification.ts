import { useEffect, useRef } from 'react'
import notifee, {
	AndroidForegroundServiceType,
	AndroidImportance,
	AndroidVisibility,
	EventType
} from '@notifee/react-native'
import { PermissionsAndroid, Platform } from 'react-native'
import * as Notification from 'expo-notifications'
import { getAllWorkoutStorage, IWorkout } from '@/store/workoutStorage'
import { formatTime } from '@/helpers/formatTime'

interface NotificationActions {
	handleClickPause: () => Promise<void>
}

interface UseWorkoutNotificationReturn {
	startNotificationTimer: () => Promise<void>
	stopNotificationTimer: () => Promise<void>
}

export const useWorkoutNotification = (actions: NotificationActions): UseWorkoutNotificationReturn => {
	const notificationIntervalRef = useRef<null | ReturnType<typeof setInterval>>(null)

	useEffect(() => {
		return notifee.onForegroundEvent(async ({ type, detail }) => {
			if (type === EventType.ACTION_PRESS) {
				if (!detail.pressAction) return
				if (detail.pressAction.id === 'pause') await actions.handleClickPause()
				if (detail.pressAction.id === 'resume') await actions.handleClickPause()
			}
		})
	}, [])

	const createChannel = async () => {
		await notifee.createChannel({
			id: 'workout',
			name: 'Отслеживание тренировки',
			importance: AndroidImportance.LOW
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
				return console.warn('Нет активной тренировки для показа уведомления')
			}

			updateNotification(active)
		}, 1000)
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

	const stopNotificationTimer = async () => {
		await notifee.stopForegroundService()
		if (notificationIntervalRef.current) {
			clearInterval(notificationIntervalRef.current)
			notificationIntervalRef.current = null
		}
	}

	return {
		startNotificationTimer,
		stopNotificationTimer
	}
}
