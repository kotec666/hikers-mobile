import React from 'react'
import { Notification } from '@/components/Notification'
import { useNotificationStore } from '@/store/notificationStore'

export function NotificationProvider() {
	const { notifications, hideNotification } = useNotificationStore()

	return (
		<>
			{notifications.map((notification, index) => (
				<Notification
					key={notification.id}
					text={notification.text}
					type={notification.type}
					clearErrorCallback={() => hideNotification(notification.id)}
				/>
			))}
		</>
	)
}
