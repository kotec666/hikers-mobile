import fetcher from '@/api/fetcher'
import { TrainingType } from '@shared/enums'
import { LocationObject } from 'expo-location'
import { toQs } from '@/helpers/toQs'

export interface ITraining {
	id: string
	type: TrainingType
	creatorId: string
	createdAt: string // '2025-12-03T01:31:11.995Z'
	startedAt: string | null
	finishedAt: string | null
}

export interface ITrainingParticipant {
	id: string
	email: string
	name: string | null
	username: string | null
	avatarFilename: string | null
}

export interface ITrainingPoint {
	alt: number
	lat: number
	lng: number
	paused: boolean
	rel_ts: number
	distance: number
	speed_kmh: number
}

export interface ITrainingMetrics {
	timeSec: number
	avgSpeedMPerSec: number
	avgTempoSecondsPerKm: number
	distanceM: number
	altitudeGainM: number
	kkcal: number
}

export interface ITrainingRoute {
	points: ITrainingPoint[]
	createdAt: string
	startedAt: string | null
	finishedAt: string | null
}

export interface IParticipantTrainingRoute {
	id: string
	user: ITrainingParticipant
	route: ITrainingRoute
	metrics: ITrainingMetrics
}

export interface IExtendedTrainingResponse {
	id: string
	type: TrainingType
	creatorId: string
	createdAt: string
	startedAt: string
	finishedAt: string | null
	creator: ITrainingParticipant
	participants: IParticipantTrainingRoute[]
}

// Получить историю тренировок (завершённые, где пользователь был участником)
export const getMyHistory = async (): Promise<ITraining[]> => {
	return (await fetcher.get(`trainings/history`)).json()
}

// Получить детали тренировки по ID
export const getExtendedDetails = async (trainingId: string): Promise<IExtendedTrainingResponse> => {
	return (await fetcher.get(`trainings/extended/${trainingId}`)).json()
}

// Получить тренировку по ID
export const getTrainingInfo = async (trainingId: string): Promise<ITraining[]> => {
	return (await fetcher.get(`trainings/${trainingId}`)).json()
}

// Начать тренировку
export const startTraining = async (data: { type: TrainingType; ts?: number }): Promise<ITraining> => {
	return (
		await fetcher.post(`trainings/start`, {
			json: data
		})
	).json()
}

// Создать оффлайн тренировку (для загрузки имеющихся данных о тренировке) (только для тех, у которых ещё нет id)
export const createOfflineTraining = async (data: {
	type: TrainingType
	startedAt: number
	finishedAt: number
}): Promise<ITraining> => {
	return (
		await fetcher.post(`trainings/offline`, {
			json: data
		})
	).json()
}

// При завершении загрузки оффлайн тренировки
export const finishOfflineTraining = async (trainingId: string): Promise<{ success: boolean }> => {
	return (await fetcher.patch(`trainings/calc-metrics/${trainingId}`)).json()
}

// Завершить тренировку
export const finishTraining = async (data?: { ts?: number }): Promise<{ success: boolean }> => {
	return (
		await fetcher.post('trainings/finish', {
			json: data
		})
	).json()
}

// Передать метрики по тренировке (можно частями)
export const syncTraining = async (
	trainingId: string | null,
	metrics: {
		relTs: number
		alt: number
		speed_kmh: number
		paused: boolean
		lat: number
		lng: number
		locationObject: Omit<LocationObject, 'mocked'>
	}[]
): Promise<{ success: boolean }> => {
	if (!trainingId) return { success: false }
	return (
		await fetcher.patch(`trainings/sync/${trainingId}`, {
			json: {
				metrics
			}
		})
	).json()
}

// Удалить незавершенную тренировку (не будет отображена в истории тренировок)
export const deleteNotFinishedTraining = async (): Promise<{ success: boolean }> => {
	return (await fetcher.delete(`trainings/delete-not-finished`)).json()
}

// Удалить незавершенную тренировку по её id (не будет отображена в истории тренировок)
export const deleteNotFinishedTrainingById = async (trainingId: string): Promise<{ success: boolean }> => {
	return (await fetcher.delete(`trainings/delete-not-finished/${trainingId}`)).json()
}

export interface ITrainingHistoryItem {
	id: string
	type: TrainingType
	createdAt: string
	distanceM: number | null
	startedAt: null | string
	finishedAt: null | string
}
// Получить историю своих тренировок
export const getMyHistoryTrainings = async (data: {
	page: number
	limit: number
	finished: boolean
	types?: string // run,run,run
}): Promise<ITrainingHistoryItem[]> => {
	return (await fetcher.get(`trainings/my?${toQs(data)}`)).json()
}
