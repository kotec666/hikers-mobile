import * as Notifications from 'expo-notifications'

export const initializeNotifications = async () => {
	await Notifications.requestPermissionsAsync()
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldPlaySound: false,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: false
		})
	})

	await Notifications.setNotificationCategoryAsync('workout-controls', [
		{ identifier: 'pause', buttonTitle: '⏸ Пауза' },
		{ identifier: 'resume', buttonTitle: '▶ Продолжить' },
		{ identifier: 'stop', buttonTitle: '⏹ Завершить', options: { isDestructive: true } }
	])
}
