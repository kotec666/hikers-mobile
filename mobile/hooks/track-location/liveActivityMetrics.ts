import type { LocationObject } from 'expo-location'
import { getLastActiveWorkoutPoint, getWorkoutDistanceMeters, getWorkoutMeta } from '@/store/workoutStorage'
import {
	pauseWorkoutLiveActivity,
	resumeWorkoutLiveActivity,
	startWorkoutLiveActivity,
	updateWorkoutLiveActivityMetrics
} from '@/hooks/track-location/liveActivity'
import {
	calculateAverageSpeedKmh,
	calculateSpeedKmh,
	formatMetricNumber,
	getWorkoutElapsedMs
} from '@/helpers/workoutMetrics'
import type { TrainingType } from '@shared/enums'

export const updateWorkoutLiveActivityFromLastLocation = async (
	lastLocation: LocationObject | undefined,
	userId?: string
): Promise<void> => {
	if (!lastLocation || !userId) return

	const meta = getWorkoutMeta(userId)
	if (!meta) return

	const distanceMeters = getWorkoutDistanceMeters(userId)
	const elapsedMs = getWorkoutElapsedMs(meta)
	const speedKmh = calculateSpeedKmh(lastLocation.coords.speed)
	const averageSpeedKmh = calculateAverageSpeedKmh(distanceMeters, elapsedMs)

	await updateWorkoutLiveActivityMetrics({
		distanceText: formatMetricNumber(distanceMeters / 1000),
		speedText: formatMetricNumber(speedKmh),
		averageSpeedText: formatMetricNumber(averageSpeedKmh),
		lastLocationTimestamp: lastLocation.timestamp
	})
}

export const restoreWorkoutLiveActivity = async (workoutType: TrainingType, userId?: string): Promise<void> => {
	if (!userId) return

	const meta = getWorkoutMeta(userId)
	if (!meta) return

	const elapsedMs = getWorkoutElapsedMs(meta)
	const liveActivityNow = meta.isPaused && meta.lastPauseAt ? meta.lastPauseAt : Date.now()
	const liveActivityStartedAt = liveActivityNow - elapsedMs

	await startWorkoutLiveActivity(workoutType, liveActivityStartedAt, meta.isPaused ? meta.lastPauseAt : null)

	if (meta.isPaused) {
		await pauseWorkoutLiveActivity()
	} else {
		await resumeWorkoutLiveActivity()
	}

	const lastPoint = getLastActiveWorkoutPoint(userId)
	await updateWorkoutLiveActivityFromLastLocation(lastPoint?.locationObject, userId)
}
