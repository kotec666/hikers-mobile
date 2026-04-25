import fetcher from '@/api/fetcher'
import { toQs } from '@/helpers/toQs'
import { NotificationType } from '@shared/enums'
import { ISuccess } from '@/api/posts'

export interface INotification {
	id: string
	action: {
		text: string
		iconFilename: null | string
		relEntityId: null | string
	}
	type: NotificationType
	createdAt: string
	readedAt: null | string
}

// Получение списка уведомлений
export const getNotificationsList = async (data: {
	page: number
	limit: number
	read?: boolean
}): Promise<INotification[]> => {
	return (await fetcher.get(`notifications?${toQs(data)}`)).json()
}

// Удалить уведы. Если массив ids пустой - удалятся все
export const deleteNotificationsById = async (data: { ids: string[] }): Promise<ISuccess> => {
	return (
		await fetcher.delete(`notifications/delete`, {
			json: data
		})
	).json()
}

// Пометить уведы как прочитанные
export const markNotificationsAsReadById = async (data: { ids: string[] }): Promise<ISuccess> => {
	return (
		await fetcher.patch(`notifications/read`, {
			json: data
		})
	).json()
}

// Проверка есть ли непрочитанные уведомления
export const checkIsUnreadNotificationsExists = async (): Promise<{ exists: boolean }> => {
	return (await fetcher.get('notifications/have-unread')).json()
}
