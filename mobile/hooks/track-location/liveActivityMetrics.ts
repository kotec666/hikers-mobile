import type { LocationObject } from 'expo-location'
import { getWorkoutDistanceMeters, getWorkoutMeta } from '@/store/workoutStorage'
import { updateWorkoutLiveActivityMetrics } from '@/hooks/track-location/liveActivity'
import {
	calculateAverageSpeedKmh,
	calculateSpeedKmh,
	formatMetricNumber,
	getWorkoutElapsedMs
} from '@/helpers/workoutMetrics'

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
