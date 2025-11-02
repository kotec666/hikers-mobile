/** Тип тренировки */
export enum TrainingType {
	RUN = 'run',
	TRACK = 'track',
	BICYCLE = 'bicycle',
}

/** Название для карточки активности в профиле */
export enum UserActivity {
	RUN = 'run',
	TRACK = 'track',
	BICYCLE = 'bicycle',
	STEPS = 'steps',
}

/** Единицы измерения */
export enum MeasuringUnit {
	METER = 'm',
	KILOMETER = 'km',
	/** Просто Количество. Например - 10000 <чего-то> */
	COUNT = 'cnt',
	/** Кол-во повторений. Например - присел 100 **раз** */
	REPEATS = 'reps',
}

/** Статус дружбы между пользователями */
export enum FriendStatus {
	FALSE = 'false',
	TRUE = 'true',
	INVITED = 'invited',
}
