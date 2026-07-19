import fetcher from '@/api/fetcher'
import { IUser } from '@/store/authStore'
import { IAchievement } from '@/api/achievements'
import { IActivity } from '@/api/activities'
import { FriendStatus } from '@shared/enums'
import { ISuccess } from '@/api/posts'

export interface IProfileAchievement extends IAchievement {
	place: null | string
}

export interface IProfile {
	user: IUser
	subscribers: number
	subscriptions: number
	friends: number
	achievements: IProfileAchievement[]
	activities: IActivity[]
	// posts: string[]
}

export interface INotMyProfile extends IProfile {
	isFriend: FriendStatus
	isSubscribed: boolean
}

// Получение данных своего профиля
export const getProfileData = async (): Promise<IProfile> => {
	return (await fetcher.get('profile')).json()
}

// Получение данных чужого профиля
export const getUserProfileData = async (userId: string): Promise<INotMyProfile> => {
	return (await fetcher.get(`profile/${userId}`)).json()
}

// Редактирование своего профиля
/**
 *
 * {
 *    username?: string
 *    name?: string
 *    avatarFilename?: string
 *    activities?: UserActivity
 *    achievements?: string[]
 * }
 *
 */
/**
 * avatarFilename: не передается - удаление
 * avatarFilename: string старая картинка
 * avatarFilename: file новая картинка
 */
export const editProfileData = async (data: BodyInit): Promise<IProfile> => {
	return (
		await fetcher.patch(`profile`, {
			body: data
		})
	).json()
}

// Выбор своего цвета
export const editProfileColor = async (colorRgb: string): Promise<ISuccess> => {
	return (
		await fetcher.patch('profile/set-color', {
			json: { colorRgb }
		})
	).json()
}

// Выбор эмодзи в профиле
export const editProfileBadge = async (badge: string): Promise<ISuccess> => {
	return (
		await fetcher.patch('profile/set-badge', {
			json: { badge }
		})
	).json()
}

// Удаление своего аккаунта
export const deleteMyAccount = async (): Promise<ISuccess> => {
	return (await fetcher.delete('user/me')).json()
}
