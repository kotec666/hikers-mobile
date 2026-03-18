import { TrainingType } from '@shared/enums'
import fetcher from './fetcher'
import { ITrainingMetrics, ITrainingRoute } from '@/api/workout'
import { IUser } from '@/types/interfaces'
import { cache } from 'react'

export interface IParticipant {
	id: string
	user: IUser
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

export const getPostByIdCached = cache(async (postId: string, token: string): Promise<IPost> => {
	return await fetcher.get(`posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } }).json()
})
