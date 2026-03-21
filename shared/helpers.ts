import { TrainingType } from './enums'

/**
 * timeMs: общее активное время (без пауз)
 * distanceMeters: общая дистанция в метрах
 * type: TrainingType тип тренировки
 * weightKg: вес пользователя
 * @returns калории = MET × вес(кг) × время(часы)
 */
export const calculateCalories = (
	timeMs: number,
	distanceMeters: number,
	type: TrainingType,
	weightKg: number = 70 // если нет профиля — ставим средний вес
): number => {
	if (!timeMs || !distanceMeters) return 0
	// @TODO можно улучшить за счёт добавления фактора подъёма
	const hours = timeMs / 1000 / 3600
	const speedKmh = distanceMeters / 1000 / hours

	let MET = 1

	if (type === TrainingType.RUN) {
		// MET по скорости
		if (speedKmh < 7) MET = 6
		else if (speedKmh < 9) MET = 8.3
		else if (speedKmh < 11) MET = 10
		else if (speedKmh < 13) MET = 12.5
		else MET = 15
	}

	if (type === TrainingType.WALK) {
		MET = 3.5
	}

	if (type === TrainingType.BICYCLE) {
		if (speedKmh < 16) MET = 4
		else if (speedKmh < 20) MET = 6.8
		else MET = 8
	}

	return Math.round(MET * weightKg * hours)
}

/**
 * Вычисляет расстояние между двумя точками по координатам (в метрах)
 */
export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
	const R = 6_371_000 // радиус Земли в метрах
	const toRad = (deg: number) => (deg * Math.PI) / 180

	const dLat = toRad(lat2 - lat1)
	const dLon = toRad(lon2 - lon1)

	const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2

	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
	return R * c
}
