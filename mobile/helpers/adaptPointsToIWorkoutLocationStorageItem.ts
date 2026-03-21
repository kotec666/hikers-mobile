// Тип-гард для определения типа данных
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { ITrainingPoint } from '@/api/workout'

const isWorkoutLocationStorageItem = (
	items: IWorkoutLocationStorageItem[] | ITrainingPoint[]
): items is IWorkoutLocationStorageItem[] => {
	return items.length > 0 && 'relTs' in items[0]
}

const adaptTrainingPoint = (
	point: ITrainingPoint,
	index: number,
	isSavedToServer: boolean = true
): IWorkoutLocationStorageItem => {
	return {
		pointId: index,
		relTs: point.rel_ts,
		locationObject: {
			coords: {
				latitude: point.lat,
				longitude: point.lng,
				altitude: point.alt,
				accuracy: null, // нет в ITrainingPoint
				altitudeAccuracy: null, // нет в ITrainingPoint
				heading: null, // нет в ITrainingPoint
				speed: point.speed_kmh ? point.speed_kmh / 3.6 : null // км/ч -> м/с
			},
			timestamp: 0, // startedAt + point.rel_ts * 1000
			mocked: false
		},
		paused: point.paused,
		isSavedToServer
	}
}

// Основная функция адаптации массива
export const adaptLocations = (
	locations: IWorkoutLocationStorageItem[] | ITrainingPoint[]
): IWorkoutLocationStorageItem[] => {
	if (!locations || locations.length === 0) return []

	if (isWorkoutLocationStorageItem(locations)) {
		return locations
	}

	return locations.map((point, index) => adaptTrainingPoint(point, index))
}
