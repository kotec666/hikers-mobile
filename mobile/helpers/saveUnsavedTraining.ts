import {
	assignIdToAnUnsavedWorkout,
	deleteUnsavedTrainingByStartedAt,
	getUnsavedWorkoutByStartedAt,
	markUnsavedWorkoutPointsAsSaved
} from '@/store/workoutStorage'
import { deleteNotFinishedTraining, finishTraining, startTraining, syncTraining } from '@/api/workout'
import { randomHexColor } from '@/helpers/randomHexColor'
import { chunkArray } from '@/helpers/chunkArray'
import { prepareLocationsForSync } from '@/helpers/prepareLocationsForSync'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'

export const saveSingleWorkout = async (startedAt: number, userId?: string): Promise<boolean> => {
	try {
		let workout = getUnsavedWorkoutByStartedAt(startedAt, userId)
		if (!workout) return false

		let trainingId = workout.id

		// 1. Создаём тренировку если её нет
		if (!trainingId) {
			const newTraining = await startTraining({
				type: workout.type,
				colorHex: randomHexColor(),
				ts: workout.startedAt
			})

			trainingId = newTraining.id
			assignIdToAnUnsavedWorkout(workout.startedAt, trainingId, userId)
		}

		while (true) {
			workout = getUnsavedWorkoutByStartedAt(startedAt, userId)
			if (!workout) return true

			const unsavedPoints = workout.locations.filter((p) => !p.isSavedToServer)

			// Все точки отправлены → finish
			if (unsavedPoints.length === 0) {
				const result = await finishTraining({
					ts: workout.locations[workout.locations.length - 1].relTs + workout.startedAt
				})

				if (result.success) {
					deleteUnsavedTrainingByStartedAt(workout.startedAt, userId)
				}

				return result.success
			}

			const [batch] = chunkArray(unsavedPoints)

			const syncResult = await syncTraining(trainingId, prepareLocationsForSync(batch))

			if (!syncResult?.success) {
				console.warn('[sync] Partial sync, will retry later:', startedAt)
				return false
			}

			const prevCount = unsavedPoints.length

			markUnsavedWorkoutPointsAsSaved(
				workout.startedAt,
				batch.map((p) => p.pointId),
				userId
			)

			const updated = getUnsavedWorkoutByStartedAt(workout.startedAt, userId)

			const nextCount = updated?.locations.filter((p) => !p.isSavedToServer).length ?? 0

			if (nextCount >= prevCount) {
				console.error('[sync] No progress, abort loop')
				return false
			}
		}
	} catch (e) {
		const res = await e.response.json()
		console.error('[sync] syncSingleWorkout error', e)
		console.error('[sync] syncSingleWorkout error', e.message)
		console.error('[sync] syncSingleWorkout error', res)
		console.error('[sync] syncSingleWorkout error', JSON.stringify(res))
		return false
	}
}

export const deleteSingleWorkout = async (startedAt: number, userId?: string): Promise<boolean> => {
	let workout = getUnsavedWorkoutByStartedAt(startedAt, userId)
	if (!workout) return false

	let trainingId = workout.id

	// 1. Завершаем тренировку на бэкенде, если у неё есть id
	if (trainingId) {
		try {
			const result = await deleteNotFinishedTraining() // { id: trainingId }
			if (result.success) {
				deleteUnsavedTrainingByStartedAt(workout.startedAt, userId)
			}
			return result.success
		} catch (e: unknown) {
			await getFieldsErrors(e)
			return false
		}
	}

	deleteUnsavedTrainingByStartedAt(workout.startedAt, userId)
	return true
}
