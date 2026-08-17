import * as Notifications from 'expo-notifications'
import { Platform } from 'react-native'
import i18n from '@/i18next/i18next'
import { getWorkoutAutoFinishDeadline, getWorkoutAutoFinishWarningTime } from '@/helpers/workoutAutoFinish'

export const WORKOUT_AUTO_FINISH_CHANNEL_ID = 'workout-auto-finish'

export const getWorkoutAutoFinishWarningNotificationId = (startedAt: number): string =>
	`workout-auto-finish-warning-${startedAt}`

export const getWorkoutAutoFinishDoneNotificationId = (startedAt: number): string =>
	`workout-auto-finish-done-${startedAt}`

// Хендлер должен быть установлен как можно раньше, до получения уведомлений.
Notifications.setNotificationHandler({
	handleNotification: async () => ({
		shouldShowBanner: true,
		shouldShowList: true,
		shouldPlaySound: false,
		shouldSetBadge: false
	})
})

export const initializeWorkoutAutoFinishNotifications = async (): Promise<void> => {
	if (Platform.OS === 'android') {
		await Notifications.setNotificationChannelAsync(WORKOUT_AUTO_FINISH_CHANNEL_ID, {
			name: i18n.t('WorkoutAutoFinish.notificationChannelName'),
			importance: Notifications.AndroidImportance.HIGH,
			vibrationPattern: [0, 250, 250, 250],
			lightColor: '#3a72ff'
		}).catch((e) => {
			console.warn('[auto-finish-notifications] failed to create channel', e)
		})
	}
}

export const requestWorkoutAutoFinishNotificationPermission = async (): Promise<boolean> => {
	try {
		const current = await Notifications.getPermissionsAsync()
		return current.granted

		// const requested = await Notifications.requestPermissionsAsync()
		// return requested.granted
	} catch (e) {
		console.warn('[auto-finish-notifications] failed to request permission', e)
		return false
	}
}

/** Планирует предупреждение (за N до автозавершения) и уведомление о завершении */
export const scheduleWorkoutAutoFinishNotifications = async (startedAt: number): Promise<void> => {
	const warningTime = getWorkoutAutoFinishWarningTime(startedAt)
	const deadline = getWorkoutAutoFinishDeadline(startedAt)

	const tasks: Promise<void>[] = []

	// Не планируем уведомление, если время уже прошло
	if (warningTime > Date.now()) {
		tasks.push(
			Notifications.scheduleNotificationAsync({
				identifier: getWorkoutAutoFinishWarningNotificationId(startedAt),
				content: {
					title: i18n.t('WorkoutAutoFinish.warningTitle'),
					body: i18n.t('WorkoutAutoFinish.warningBody')
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.DATE,
					date: warningTime,
					channelId: WORKOUT_AUTO_FINISH_CHANNEL_ID
				}
			})
				.then(() => undefined)
				.catch((e) => console.warn('[auto-finish-notifications] failed to schedule warning', e))
		)
	}

	if (deadline > Date.now()) {
		tasks.push(
			Notifications.scheduleNotificationAsync({
				identifier: getWorkoutAutoFinishDoneNotificationId(startedAt),
				content: {
					title: i18n.t('WorkoutAutoFinish.doneTitle'),
					body: i18n.t('WorkoutAutoFinish.doneBody')
				},
				trigger: {
					type: Notifications.SchedulableTriggerInputTypes.DATE,
					date: deadline,
					channelId: WORKOUT_AUTO_FINISH_CHANNEL_ID
				}
			})
				.then(() => undefined)
				.catch((e) => console.warn('[auto-finish-notifications] failed to schedule done', e))
		)
	}

	await Promise.all(tasks)
}

/** Отменяет запланированные уведомления автозавершения (при ручном финише) */
export const cancelWorkoutAutoFinishNotifications = async (startedAt: number): Promise<void> => {
	await Promise.all([
		Notifications.cancelScheduledNotificationAsync(getWorkoutAutoFinishWarningNotificationId(startedAt)).catch(
			() => undefined
		),
		Notifications.cancelScheduledNotificationAsync(getWorkoutAutoFinishDoneNotificationId(startedAt)).catch(
			() => undefined
		)
	])
}
