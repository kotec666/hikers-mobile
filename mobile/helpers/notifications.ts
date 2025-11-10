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
}
