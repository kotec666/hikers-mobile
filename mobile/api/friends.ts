import { IUser } from '@/store/authStore'
import fetcher from '@/api/fetcher'
import { toQs } from '@/helpers/toQs'

export interface IFriend {
	user: IUser
	createdAt: string
}

export interface IInvite {
	user: IUser
	invitedUser: IUser
}

// Получить список своих друзей
export const getMyFriendsList = async (data: { page: number; limit: number }): Promise<IFriend[]> => {
	return (await fetcher.get(`friends?${toQs(data)}`)).json()
}

// Получить друга по его id
export const getFriendById = async (friendId: string): Promise<IFriend> => {
	return (await fetcher.get(`friends/${friendId}`)).json()
}

// Удалить друга из друзей по его id
export const deleteFriendById = async (friendId: string): Promise<IFriend> => {
	return (await fetcher.delete(`friends/${friendId}`)).json()
}

// Отозвать свой запрос в друзья к юзеру по его id
export const revokeFriendInviteByUserId = async (
	userId: string
): Promise<{
	success: boolean
}> => {
	return (await fetcher.delete(`friends/invites/revoke/${userId}`)).json()
}

// Получить все исходящие (ожидающие) запросы в друзья
export const getSentInvitesList = async (): Promise<IInvite[]> => {
	return (await fetcher.get(`friends/invites/sent`)).json()
}

// Получить все входящие (ожидающие) запросы в друзья
export const getPendingInvitesList = async (data: { page: number; limit: number }): Promise<IInvite[]> => {
	return (await fetcher.get(`friends/invites/pending?${toQs(data)}`)).json()
}

// Отправить запрос пользователю в друзья по его id
export const addAsFriend = async (userId: string): Promise<IInvite> => {
	return (await fetcher.post(`friends/invites/send/${userId}`)).json()
}

// Принять запрос в друзья по id будущего друга
export const acceptFriendRequest = async (userId: string): Promise<IFriend> => {
	return (await fetcher.patch(`friends/invites/accept/${userId}`)).json()
}

// Отклонить запрос в друзья по id
export const rejectFriendRequest = async (userId: string): Promise<IInvite> => {
	return (await fetcher.patch(`friends/invites/reject/${userId}`)).json()
}

// Отозвать свой запрос в друзья к юзеру по его id
export const revokeFriendRequestByUserId = async (userId: string): Promise<IInvite> => {
	return (await fetcher.delete(`/friends/invites/revoke/${userId}`)).json()
}
