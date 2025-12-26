import { getActiveWorkoutPoints, getWorkoutMeta } from '@/store/workoutStorage'
import { deserializeGetterType } from '@/helpers/binarySerializer'

const MIN_WORKOUT_DURATION_MS = 2 * 60 * 1000 // минимум 2 минуты
const MIN_POINTS_COUNT = 5 // минимум 5 точек GPS

export const isWorkoutTooShort = (): boolean => {
	const meta = getWorkoutMeta()
	if (!meta) return false

	const now = Date.now()
	const activeDuration = now - meta.startedAt - meta.totalPausedMs

	const points = getActiveWorkoutPoints(deserializeGetterType.ALL)
	const pointsCount = points.length

	return activeDuration < MIN_WORKOUT_DURATION_MS || pointsCount < MIN_POINTS_COUNT
}
