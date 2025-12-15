import * as Notifications from 'expo-notifications'

export const initializeNotifications = async (innerAppMountedPromise: Promise<void>) => {
	// Delay starting the task until the inner app is mounted
	await innerAppMountedPromise
	await Notifications.requestPermissionsAsync()
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldPlaySound: false,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: false,
			shouldShowAlert: true
		})
	})
}
