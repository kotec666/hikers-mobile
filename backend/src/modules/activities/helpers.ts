import { MeasuringUnit, TrainingType, UserActivity } from '@shared/enums';

/** Получить стандартные единицы измерения для активности.
 * @throws Error, если передана несуществующая активность
 */
export const getDefaultMeasuringUnitByActivity = (activity: UserActivity): MeasuringUnit => {
	switch (activity) {
		case UserActivity.RUN:
			return MeasuringUnit.METER;
		case UserActivity.TRACK:
			return MeasuringUnit.KILOMETER;
		case UserActivity.BICYCLE:
			return MeasuringUnit.KILOMETER;
		case UserActivity.STEPS:
			return MeasuringUnit.COUNT;

		default:
			throw new Error(`Activity ${activity} not found`);
	}
};

/** Получить активность по типу тренировки.
 * @returns активность, или null - если для такого типа нет подходящей активности
 */
export const getActivityByTrainingType = (type: TrainingType): UserActivity | null => {
	switch (type) {
		case TrainingType.RUN:
			return UserActivity.RUN;
		case TrainingType.BICYCLE:
			return UserActivity.BICYCLE;
		case TrainingType.TRACK:
			return UserActivity.TRACK;
		case TrainingType.WALK:
			return UserActivity.STEPS;

		default:
			return null;
	}
};
