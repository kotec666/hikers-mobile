import { create } from 'zustand'
import { NotificationInAppType } from '@/components/Notification'

interface Notification {
	id: string
	text: string
	type: NotificationInAppType
}

interface NotificationStore {
	notifications: Notification[]
	showNotification: (text: string, type: NotificationInAppType) => void
	hideNotification: (id: string) => void
	clearAll: () => void
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
	notifications: [],

	showNotification: (text: string, type: NotificationInAppType) => {
		const id = Date.now().toString()

		set((state) => ({
			notifications: [...state.notifications, { id, text, type }]
		}))

		setTimeout(() => {
			get().hideNotification(id)
		}, 3500)
	},

	hideNotification: (id: string) => {
		set((state) => ({
			notifications: state.notifications.filter((notification) => notification.id !== id)
		}))
	},

	clearAll: () => {
		set({ notifications: [] })
	}
}))
