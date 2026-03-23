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

		// set((state) => ({
		// 	notifications: [...state.notifications, { id, text, type }] // в бесконечную очередь уведомлений
		// }))

		// показ только трёх уведомлений за раз, самое старое затирается
		// set((state) => {
		// 		const newNotification = { id, text, type }
		//
		// 		// если уже 3 — убираем самое старое (первый элемент)
		// 		const trimmed =
		// 			state.notifications.length >= 3
		// 				? state.notifications.slice(1)
		// 				: state.notifications
		//
		// 		return {
		// 			notifications: [...trimmed, newNotification]
		// 		}
		// 	})

		set(() => ({
			notifications: [{ id, text, type }] // только одно за раз
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
