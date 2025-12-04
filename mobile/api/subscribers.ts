import fetcher from '@/api/fetcher'
import { IUser } from '@/store/authStore'

export interface ISubscribe {
	user: IUser
	createdAt: string
}

// Подписка на пользователя по его id
export const subscribeToUser = async (
	userId: string
): Promise<{
	success: boolean
}> => {
	return (await fetcher.post(`subscribers/${userId}`)).json()
}

// Отписка от пользователя по его id
export const unsubscribeFromUser = async (
	userId: string
): Promise<{
	success: boolean
}> => {
	return (await fetcher.delete(`subscribers/${userId}`)).json()
}

// Получить список своих подписок
export const getSubscriptionsList = async (): Promise<ISubscribe[]> => {
	return (await fetcher.get(`subscribers/me`)).json()
}

// Получить список своих подписчиков
export const getSubscribersList = async (): Promise<ISubscribe[]> => {
	return (await fetcher.get(`subscribers/my`)).json()
}
