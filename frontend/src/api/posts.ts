import { TrainingType } from '@shared/enums'
import fetcher from './fetcher'
import { ITrainingMetrics, ITrainingRoute } from '@/api/workout'
import { IPublicUser, IUser } from '@/types/interfaces'
import { cache } from 'react'

export interface IParticipant {
	id: string
	user: IPublicUser
	colorHex: null | string
	route: ITrainingRoute
	metrics: ITrainingMetrics
}

export interface IPostTraining {
	id: string
	type: TrainingType
	creatorId: string
	createdAt: string
	startedAt: null | string
	finishedAt: null | string
	creator: IPublicUser
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

export type IGuestPost = Omit<IPost, 'isSubscribed' | 'isLiked'>

// Получение подробного поста по его id
export const getPostById = async (postId: string, token: string): Promise<IPost> => {
	return (
		await fetcher.get(`posts/${postId}`, {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
	).json()
}

// Получение поста по его id для неавторизованного пользователя
export const getPostByIdForGuest = async (postId: string): Promise<IGuestPost> => {
	return (await fetcher.get(`posts/for-guest/${postId}`)).json()
}

export const getPostByIdForGuestCached = cache(async (postId: string): Promise<IGuestPost> => {
	return await fetcher.get(`posts/for-guest/${postId}`).json()
})
