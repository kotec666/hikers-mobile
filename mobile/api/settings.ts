import fetcher from '@/api/fetcher'
import { NotificationType } from '@shared/enums'
import { ISuccess } from '@/api/posts'

// Маппинг enum в объект с boolean
export type NotificationSettings = {
	[K in NotificationType as K extends 'ACHIEVEMENT' ? 'new_achievement' : K]: boolean
}

// Получить настройки уведомлений
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
	return (await fetcher.get('notifications/settings')).json()
}

// Настроить получение уведомлений
export const changeNotificationSettings = async (data: NotificationSettings): Promise<ISuccess> => {
	return (
		await fetcher.patch(`notifications/settings`, {
			json: { settings: data }
		})
	).json()
}
