import { useNotificationStore } from '@/store/notificationStore'
import { NotificationInAppType } from '@/components/Notification'

export const useToast = () => {
	const { showNotification } = useNotificationStore()

	const toast = {
		error: (message: string) => {
			showNotification(message, NotificationInAppType.ERROR)
		},
		success: (message: string) => {
			showNotification(message, NotificationInAppType.SUCCESS)
		},
		info: (message: string, onPress?: () => void) => {
			showNotification(message, NotificationInAppType.INFO, onPress)
		}
	}

	return toast
}
