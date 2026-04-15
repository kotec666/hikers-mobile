import { getActiveWorkoutPoints, getWorkoutMeta } from '@/store/workoutStorage'
import { deserializeGetterType } from '@/helpers/binarySerializer'
import { getWorkoutElapsedMs } from '@/helpers/workoutMetrics'

const MIN_WORKOUT_DURATION_MS = 30 * 1000 // 30 секунд
const MIN_POINTS_COUNT = 3 // минимум 3 точек GPS

export const isWorkoutTooShort = (userId?: string): boolean => {
	const meta = getWorkoutMeta(userId)
	if (!meta) return false

	const activeDuration = getWorkoutElapsedMs(meta)

	const points = getActiveWorkoutPoints(deserializeGetterType.ALL, userId)
	const pointsCount = points.length

	return activeDuration < MIN_WORKOUT_DURATION_MS || pointsCount < MIN_POINTS_COUNT
}
