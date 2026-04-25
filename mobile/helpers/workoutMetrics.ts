import type { IWorkoutMeta } from '@/store/workoutStorage'

export const getWorkoutElapsedMs = (meta: IWorkoutMeta, now: number = Date.now()): number => {
	if (meta.isPaused && meta.lastPauseAt) {
		return Math.max(0, meta.lastPauseAt - meta.startedAt - meta.totalPausedMs)
	}

	return Math.max(0, now - meta.startedAt - meta.totalPausedMs)
}

export const calculateAverageSpeedKmh = (distanceMeters: number, elapsedMs: number): number => {
	if (!Number.isFinite(distanceMeters) || !Number.isFinite(elapsedMs) || distanceMeters <= 0 || elapsedMs <= 0) {
		return 0
	}

	const averageSpeedKmh = (distanceMeters * 3600) / elapsedMs

	return Number.isFinite(averageSpeedKmh) && averageSpeedKmh > 0 ? averageSpeedKmh : 0
}

export const calculateSpeedKmh = (speedMps?: number | null): number => {
	const speedKmh = Math.max(0, (speedMps ?? 0) * 3.6)

	return Number.isFinite(speedKmh) ? speedKmh : 0
}

export const formatMetricNumber = (value: number, fractionDigits: number = 1): string => {
	if (!Number.isFinite(value) || value < 0) return Number(0).toFixed(fractionDigits)

	return value.toFixed(fractionDigits)
}
