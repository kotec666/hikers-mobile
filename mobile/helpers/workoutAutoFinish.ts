import { ERRORS } from '@shared/errors'
import { WorkoutSource, saveSingleWorkout } from '@/helpers/saveUnsavedTraining'
import { finishOfflineTraining, finishTraining } from '@/api/workout'
import {
	clearActiveWorkoutData,
	getWorkoutMeta,
	moveActiveWorkoutToNotSaved,
	type IWorkoutMeta
} from '@/store/workoutStorage'
import { WORKOUT_AUTO_FINISH_AFTER_MS, WORKOUT_AUTO_FINISH_WARNING_BEFORE_MS } from '@/constants/WorkoutAutoFinish'

export type AutoFinishResult = 'finished' | 'moved-to-unsaved' | 'already-finished' | 'no-op'

/** Защита от параллельного запуска (фоновая задача + foreground одновременно) */
let isAutoFinishing = false

export const getWorkoutAutoFinishDeadline = (startedAt: number): number => startedAt + WORKOUT_AUTO_FINISH_AFTER_MS

export const getWorkoutAutoFinishWarningTime = (startedAt: number): number =>
	startedAt + WORKOUT_AUTO_FINISH_AFTER_MS - WORKOUT_AUTO_FINISH_WARNING_BEFORE_MS

export const isWorkoutDueForAutoFinish = (meta: IWorkoutMeta | null | void, now: number = Date.now()): boolean => {
	if (!meta) return false

	return now >= getWorkoutAutoFinishDeadline(meta.startedAt)
}

// Сырая функция завершения без react-query (вызывается из фоновой задачи)
const rawFinishWorkout = async (data: { workoutId?: string; ts?: number }): Promise<{ success: boolean }> => {
	if (data.workoutId) {
		return finishOfflineTraining(data.workoutId)
	}

	return finishTraining({ ts: data.ts })
}

const getServerErrorMessage = async (e: unknown): Promise<string | null> => {
	try {
		if (typeof e === 'object' && e !== null && 'response' in e) {
			const response = (e as { response?: { json?: () => Promise<{ message?: string }> } }).response
			if (response?.json) {
				const body = await response.json().catch(() => null)
				return body?.message ?? null
			}
		}

		if (typeof e === 'object' && e !== null && 'message' in e) {
			return (e as { message?: string }).message ?? null
		}
	} catch {}

	return null
}

/**
 * Автоматическое завершение активной тренировки по истечении N.
 * Повторяет путь обычного финиша (синк точек + завершение на сервере + очистка локального стейта).
 */
export const autoFinishActiveWorkout = async (userId?: string): Promise<AutoFinishResult> => {
	if (!userId || isAutoFinishing) return 'no-op'

	isAutoFinishing = true

	try {
		const meta = getWorkoutMeta(userId)
		if (!meta) return 'no-op'

		try {
			await saveSingleWorkout(WorkoutSource.ACTIVE, meta.startedAt, rawFinishWorkout, userId)
			return 'finished'
		} catch (e) {
			const message = await getServerErrorMessage(e)

			// тренировка уже завершена на сервере — просто чистим локальный стейт
			if (message === ERRORS.NOT_FOUND || message === ERRORS.TRAINING_ALREADY_FINISHED) {
				clearActiveWorkoutData(userId)
				return 'already-finished'
			}

			// нет интернета или другая ошибка — сохраняем данные, чтобы досинхронизировать позже
			console.warn('[auto-finish] failed to finish workout, moving to not saved:', e)
			moveActiveWorkoutToNotSaved(userId)
			return 'moved-to-unsaved'
		}
	} finally {
		isAutoFinishing = false
	}
}
