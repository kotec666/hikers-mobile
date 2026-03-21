import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'

/**
 * Вычисляет расстояние между двумя точками по координатам (в метрах)
 */
const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
	const R = 6_371_000 // радиус Земли в метрах
	const toRad = (deg: number) => (deg * Math.PI) / 180

	const dLat = toRad(lat2 - lat1)
	const dLon = toRad(lon2 - lon1)

	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}

/**
 * Принимает массив объектов, считает суммарное расстояние по последовательным активным точкам и возвращает суммарную дистанцию (в метрах, округлённую до целого)
 * @points IWorkoutLocationStorageItem[]
 * @returns number метры
 */
export const calculateTotalDistance = (points: IWorkoutLocationStorageItem[]): number => {
	let totalDistance = 0
	let prev: IWorkoutLocationStorageItem | null = null

	for (const point of points) {
		if (point.paused) {
			prev = null // разрываем трек, первая точка после паузы не соединяется с предыдущей
			continue
		}

		if (prev) {
			const prevCoords = prev.locationObject.coords
			const currCoords = point.locationObject.coords

			if (
				prevCoords.latitude != null &&
				prevCoords.longitude != null &&
				currCoords.latitude != null &&
				currCoords.longitude != null
			) {
				totalDistance += haversineDistance(
					prevCoords.latitude,
					prevCoords.longitude,
					currCoords.latitude,
					currCoords.longitude
				)
			}
		}

		prev = point
	}

	return Math.round(totalDistance)
}

// С фильтрацией только активных точек
// export const calculateTotalDistance = (points: IWorkoutLocationStorageItem[]): number => {
//     // Фильтруем только активные точки (не паузы)
//     const activePoints = points.filter(point => !point.paused)
//
//     let totalDistance = 0
//
//     for (let i = 1; i < activePoints.length; i++) {
//         const prev = activePoints[i - 1]
//         const curr = activePoints[i]
//
//         const prevCoords = prev.locationObject.coords
//         const currCoords = curr.locationObject.coords
//
//         if (
//             prevCoords.latitude != null &&
//             prevCoords.longitude != null &&
//             currCoords.latitude != null &&
//             currCoords.longitude != null
//         ) {
//             totalDistance += haversineDistance(
//                 prevCoords.latitude,
//                 prevCoords.longitude,
//                 currCoords.latitude,
//                 currCoords.longitude
//             )
//         }
//     }
//
//     return Math.round(totalDistance)
// }

export const formatDistance = (meters: number): string => {
	if (meters < 1000) {
		return `${Math.round(meters)}м`
	}

	const kilometers = meters / 1000
	const formatter = new Intl.NumberFormat('ru-RU', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 1
	})

	return `${formatter.format(kilometers)}км`
}
