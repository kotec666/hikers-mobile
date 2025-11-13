import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'

// Высота над WGS84 в метрах
export const getWorkoutHeight = (points: IWorkoutLocationStorageItem[]) => {
	// Высота над WGS84 в метрах
	const notPausedPoints = points.filter((point) => !point.isPausedPoint)
	if (notPausedPoints.length >= 2) {
		const firstPoint = notPausedPoints[0]
		const lastPoint = notPausedPoints.at(-1)
		const currentHeight = Number(lastPoint?.locationObject.coords.altitude)
		const firstHeight = Number(firstPoint.locationObject.coords.altitude)

		if (!isNaN(currentHeight) && !isNaN(firstHeight)) {
			return Math.round(currentHeight - firstHeight)
		}
	}

	return null
}
