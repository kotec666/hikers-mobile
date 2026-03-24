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

export const saveSingleWorkout = async (startedAt: number, userId?: string): Promise<void> => {
	let workout = getUnsavedWorkoutByStartedAt(startedAt, userId)
	if (!workout) {
		console.log('Тренировка не найдена')
		throw new Error('Тренировка не найдена')
	}

	let trainingId = workout.id

	// 1. Создаём тренировку если её нет
	if (!trainingId) {
		const newTraining = await startTraining({
			type: workout.type,
			colorHex: randomHexColor(),
			ts: workout.startedAt
		})

		if (!newTraining?.id) {
			console.log('Ошибка при старте тренировки')
			throw new Error('Ошибка при старте тренировки')
		}

		trainingId = newTraining.id
		assignIdToAnUnsavedWorkout(workout.startedAt, trainingId, userId)
	}

	while (true) {
		workout = getUnsavedWorkoutByStartedAt(startedAt, userId)
		if (!workout) {
			return // success
		}

		const unsavedPoints = workout.locations.filter((p) => !p.isSavedToServer)

		// Все точки отправлены → finish
		if (unsavedPoints.length === 0) {
			let result: { success?: boolean }

			try {
				result = await finishTraining({
					ts: workout.locations[workout.locations.length - 1].relTs + workout.startedAt
				})
			} catch (e) {
				console.log('FINISH TRAINING ERROR:', e)

				if (e.name === 'HTTPError') {
					try {
						const data = await e.response.json()
						console.log('RESPONSE (json):', data)
					} catch {
						const text = await e.response.text()
						console.log('RESPONSE (text):', text)
					}
				}

				throw e
			}

			if (!result?.success) {
				console.log('Ошибка при завершении тренировки')
				throw new Error('Ошибка при завершении тренировки')
			}

			if (result.success) {
				deleteUnsavedTrainingByStartedAt(workout.startedAt, userId)
			}

			return
		}

		const [batch] = chunkArray(unsavedPoints)

		const syncResult = await syncTraining(trainingId, prepareLocationsForSync(batch))

		if (!syncResult?.success) {
			console.log('Ошибка при синхронизации с сервером')
			throw new Error('Ошибка при синхронизации с сервером')
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
			throw new Error('No progress in sync loop')
		}
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
			throw e
		}
	}

	deleteUnsavedTrainingByStartedAt(workout.startedAt, userId)
	return true
}
