import {
	assignIdToActiveWorkout,
	assignIdToAnUnsavedWorkout,
	clearActiveWorkoutData,
	deleteUnsavedTrainingByStartedAt,
	getFullActiveWorkout,
	getUnsavedWorkoutByStartedAt,
	IWorkout,
	markPointsAsSaved,
	markUnsavedWorkoutPointsAsSaved
} from '@/store/workoutStorage'
import { createOfflineTraining, deleteNotFinishedTrainingById, syncTraining } from '@/api/workout'
import { chunkArray } from '@/helpers/chunkArray'
import { prepareLocationsForSync } from '@/helpers/prepareLocationsForSync'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { UseMutateAsyncFunction } from '@tanstack/react-query'
import i18n from '@/i18next/i18next'

type FinishWorkoutMutation = UseMutateAsyncFunction<
	{
		success: boolean
	},
	Error,
	{
		workoutId?: string | undefined
		ts?: number | undefined
	},
	unknown
>

type FinishWorkoutMutation = UseMutateAsyncFunction<
	{
		success: boolean
	},
	Error,
	{
		workoutId?: string | undefined
		ts?: number | undefined
	},
	unknown
>

export enum WorkoutSource {
	ACTIVE = 'active',
	UNSAVED = 'unsaved'
}

export const syncWorkoutPoints = async ({
	source,
	startedAt,
	trainingId,
	userId
}: {
	source: WorkoutSource
	startedAt: number
	trainingId: string
	userId?: string
}) => {
	while (true) {
		let workout: IWorkout | null = null
		if (source === WorkoutSource.UNSAVED) {
			workout = getUnsavedWorkoutByStartedAt(startedAt, userId)
		} else {
			workout = getFullActiveWorkout(userId)
		}
		if (!workout) return

		const unsavedPoints = workout.locations.filter((p) => !p.isSavedToServer)

		// все точки отправлены
		if (unsavedPoints.length === 0) {
			return
		}

		const [batch] = chunkArray(unsavedPoints)

		const prepared = prepareLocationsForSync(batch)

		const res = await syncTraining(trainingId, prepared)

		if (!res?.success) {
			throw new Error('Ошибка sync')
		}

		const prevCount = unsavedPoints.length

		if (source === WorkoutSource.UNSAVED) {
			markUnsavedWorkoutPointsAsSaved(
				startedAt,
				batch.map((p) => p.pointId),
				userId
			)
		} else {
			markPointsAsSaved(
				batch.map((p) => p.pointId),
				userId
			)
		}

		let updated: IWorkout | null = null
		if (source === WorkoutSource.UNSAVED) {
			updated = getUnsavedWorkoutByStartedAt(startedAt, userId)
		} else {
			updated = getFullActiveWorkout(userId)
		}

		const nextCount = updated?.locations.filter((p) => !p.isSavedToServer).length ?? 0

		if (nextCount >= prevCount) {
			throw new Error('No progress in sync loop')
		}
	}
}

function getWorkoutFinishTs(workout: IWorkout) {
	const lastLocation = workout.locations.at(-1)
	const lastLocationTs = lastLocation ? lastLocation.relTs + workout.startedAt : Date.now()

	return Math.max(workout.startedAt, lastLocationTs, Date.now())
}

async function finishWorkoutWithServerTimeFallback(finishWorkout: FinishWorkoutMutation, ts: number) {
	try {
		return await finishWorkout({ ts })
	} catch (e) {
		const status = typeof e === 'object' && e !== null && 'response' in e ? (e as any).response?.status : null
		if (status !== 409) throw e

		return await finishWorkout({})
	}
}

export const saveSingleWorkout = async (
	source: WorkoutSource,
	startedAt: number,
	finishWorkout: FinishWorkoutMutation,
	userId?: string
): Promise<null | string> => {
	let workout: IWorkout | null

	if (source === WorkoutSource.UNSAVED) {
		workout = getUnsavedWorkoutByStartedAt(startedAt, userId)
	} else {
		workout = getFullActiveWorkout(userId)
	}

	console.log(source)
	if (!workout) {
		throw new Error('Тренировка не найдена')
	}

	let trainingId = workout.id

	// =========================
	// 1. CREATE OFFLINE (если нет id)
	// =========================
	if (!trainingId) {
		const newTraining = await createOfflineTraining({
			type: workout.type,
			startedAt: workout.startedAt,
			finishedAt: getWorkoutFinishTs(workout)
		})

		if (!newTraining?.id) {
			throw new Error('Ошибка при создании оффлайн тренировки')
		}

		trainingId = newTraining.id

		if (source === WorkoutSource.UNSAVED) {
			assignIdToAnUnsavedWorkout(workout.startedAt, trainingId, userId)
		} else {
			assignIdToActiveWorkout(newTraining.id, userId)
		}

		// sync
		await syncWorkoutPoints({
			source,
			startedAt,
			trainingId,
			userId
		})

		// calc metrics
		// const finishRes = await finishOfflineTraining(trainingId)
		const finishRes = await finishWorkout({ workoutId: trainingId })

		if (!finishRes?.success) {
			throw new Error('Ошибка calc-metrics')
		}
		if (source === WorkoutSource.UNSAVED) {
			deleteUnsavedTrainingByStartedAt(startedAt, userId)
		} else {
			clearActiveWorkoutData(userId)
		}

		return trainingId
	}

	// =========================
	// ONLINE FLOW
	// =========================

	await syncWorkoutPoints({
		source,
		startedAt,
		trainingId,
		userId
	})

	let updated: IWorkout | null
	if (source === WorkoutSource.UNSAVED) {
		updated = getUnsavedWorkoutByStartedAt(startedAt, userId)
	} else {
		updated = getFullActiveWorkout(userId)
	}
	if (!updated) return null

	const result = await finishWorkoutWithServerTimeFallback(finishWorkout, getWorkoutFinishTs(updated))

	if (!result?.success) {
		throw new Error('Ошибка finish')
	}
	if (source === WorkoutSource.UNSAVED) {
		deleteUnsavedTrainingByStartedAt(startedAt, userId)
	} else {
		clearActiveWorkoutData(userId)
	}

	return trainingId
}

// только для source WorkoutSource.UNSAVED
export const deleteSingleWorkout = async (startedAt: number, userId?: string): Promise<boolean> => {
	let workout = getUnsavedWorkoutByStartedAt(startedAt, userId)
	if (!workout) return false

	let trainingId = workout.id

	// 1. Завершаем тренировку на бэкенде, если у неё есть id
	if (trainingId) {
		try {
			const result = await deleteNotFinishedTrainingById(trainingId)
			if (result.success) {
				deleteUnsavedTrainingByStartedAt(workout.startedAt, userId)
			}
			return result.success
		} catch (e: unknown) {
			await getFieldsErrors(e, i18n.t)
			throw e
		}
	}

	deleteUnsavedTrainingByStartedAt(workout.startedAt, userId)
	return true
}
