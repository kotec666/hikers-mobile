import { TrainingType } from '../../shared/enums'

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
 * timeMs: общее активное время (без пауз)
 * distanceMeters: общая дистанция в метрах
 * type: TrainingType тип тренировки
 * weightKg: вес пользователя
 * altitudeGain: набор высоты
 * sex: пол человека
 * возраст: пол человека
 */
// export interface CaloriesParams {
//     timeMs: number;
//     distanceMeters: number;
//     type: TrainingType;
//     weightKg?: number;
//     altitudeGain?: number;
//     sex?: 'male' | 'female';
//     age?: number;
// }
//
// export const calculateCalories = ({
//     timeMs,
//     distanceMeters,
//     type,
//     weightKg = 70,
//     altitudeGain = 0,
//     sex = 'male',
//     age = 30
// }: CaloriesParams): number => {
//
//     if (!timeMs || !distanceMeters) return 0;
//
//     const hours = timeMs / 1000 / 3600;
//     const speedKmh = (distanceMeters / 1000) / hours;
//
//     let MET = 1;
//
//     // --- Скоростные MET ---
//     if (type === TrainingType.RUN) {
//         if (speedKmh < 7) MET = 6;
//         else if (speedKmh < 9) MET = 8.3;
//         else if (speedKmh < 11) MET = 10;
//         else if (speedKmh < 13) MET = 12.5;
//         else MET = 15;
//     }
//
//     if (type === TrainingType.WALK) {
//         MET = speedKmh < 5.5 ? 3.3 : 4.3;
//     }
//
//     if (type === TrainingType.BICYCLE) {
//         if (speedKmh < 16) MET = 4;
//         else if (speedKmh < 20) MET = 6.8;
//         else if (speedKmh < 25) MET = 8;
//         else MET = 10;
//     }
//
//     // --- Фактор набора высоты ---
//     const elevationBoost = altitudeGain > 0
//         ? 1 + (altitudeGain / 100) * 0.05 // +5% на каждые 100м
//         : 1;
//
//     // --- Поправка на пол (женщины тратят ~7% меньше) ---
//     const sexFactor = sex === 'female' ? 0.93 : 1;
//
//     // --- Поправка на возраст (чем старше — тем ниже CAL) ---
//     const ageFactor = 1 - Math.min((age - 30), 40) * 0.002; // макс -8%
//
//     const finalMET = MET * elevationBoost * sexFactor * ageFactor;
//
//     const calories = finalMET * weightKg * hours;
//
//     return Math.round(calories);
// };
