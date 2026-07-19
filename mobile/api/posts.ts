import fetcher from '@/api/fetcher'
import { IUser } from '@/store/authStore'
import { TrainingType } from '@shared/enums'
import { toQs } from '@/helpers/toQs'
import { ITrainingMetrics, ITrainingRoute } from '@/api/workout'

export interface ISuccess {
	success: boolean
}

export interface IParticipant {
	id: string
	user: IUser
	route: ITrainingRoute
	metrics: ITrainingMetrics
}

export type ITrainingMember = Omit<IParticipant, 'route' | 'metrics'> & {
	isSubscribed: boolean
}

export interface IPostTraining {
	id: string
	type: TrainingType
	creatorId: string
	createdAt: string
	startedAt: null | string
	finishedAt: null | string
	creator: IUser
	participants: IParticipant[]
}

export interface IPost {
	id: string
	isSubscribed: boolean
	userCreator: IUser
	training: IPostTraining
	title: string
	description: null | string
	createdAt: string
	updatedAt: null | string
	fileNames: string[]
	isLiked: boolean
	likesCount: number
}

// Получение списка постов в ленте
export const getPostsFeed = async (data: { page: number; limit: number }): Promise<IPost[]> => {
	return (await fetcher.get(`posts/feed?${toQs(data)}`)).json()
}

// Получение списка постов из чужого профиля
export const getPostsByUserId = async (id: string, data: { page: number; limit: number }): Promise<IPost[]> => {
	return (await fetcher.get(`posts/by-user/${id}?${toQs(data)}`)).json()
}

// Получение списка постов из своего профиля
export const getPostsMy = async (data: { page: number; limit: number }): Promise<IPost[]> => {
	return (await fetcher.get(`posts/my?${toQs(data)}`)).json()
}

// Получить участников тренировки по id поста с пагинацией
export const getTrainingMembersByPostId = async (
	postId: string,
	data: { page: number; limit: number }
): Promise<ITrainingMember[]> => {
	return (await fetcher.get(`posts/${postId}/participants?${toQs(data)}`)).json()
}

// Получение подробного поста по его id
export const getPostById = async (postId: string): Promise<IPost> => {
	return (await fetcher.get(`posts/${postId}`)).json()
}

// Получение подробного поста по id его тренировки
export const getPostByTrainingId = async (trainingId: string): Promise<IPost> => {
	return (await fetcher.get(`posts/by-training/${trainingId}`)).json()
}

// Поставить лайк на пост по его id
export const likePostById = async (postId: string): Promise<ISuccess> => {
	return (await fetcher.post(`posts/${postId}/like`)).json()
}

// Убрать лайк с поста по его id
export const unlikePostById = async (postId: string): Promise<ISuccess> => {
	return (await fetcher.post(`posts/${postId}/unlike`)).json()
}

// Создание нового поста
/**
 *
 * {
 *    trainingId: string [id тренировки]
 *    title: string [заголовок поста]
 *    description?: [описание поста]
 *    files?: [массив изображений]
 * }
 *
 */
export const createPost = async (data: BodyInit): Promise<IPost> => {
	return (
		await fetcher.post(`posts`, {
			body: data
		})
	).json()
}

// Редактирование поста
/**
 *
 * {
 *    title: string [заголовок поста]
 *    description?: [описание поста]
 *    files?: [массив изображений]
 *    deletedFilenames?: [массив строк]
 * }
 *
 */
export const editPostById = async (postId: string, data: BodyInit): Promise<ISuccess> => {
	return (
		await fetcher.patch(`posts/${postId}`, {
			body: data
		})
	).json()
}

// Удаление своего поста
export const deletePostById = async (postId: string): Promise<ISuccess> => {
	return (await fetcher.delete(`posts/${postId}`)).json()
}
