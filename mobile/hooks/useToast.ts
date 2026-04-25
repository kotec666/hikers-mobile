import { useCallback, useMemo } from 'react'
import { useNotificationStore } from '@/store/notificationStore'
import { NotificationInAppType } from '@/components/Notification'

export const useToast = () => {
	const { showNotification } = useNotificationStore()

	const error = useCallback(
		(message: string) => {
			showNotification(message, NotificationInAppType.ERROR)
		},
		[showNotification]
	)

	const success = useCallback(
		(message: string) => {
			showNotification(message, NotificationInAppType.SUCCESS)
		},
		[showNotification]
	)

	const info = useCallback(
		(message: string, onPress?: () => void) => {
			showNotification(message, NotificationInAppType.INFO, onPress)
		},
		[showNotification]
	)

	return useMemo(
		() => ({
			error,
			success,
			info
		}),
		[error, success, info]
	)
}
