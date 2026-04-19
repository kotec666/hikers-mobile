/** Тип тренировки */
export enum TrainingType {
	RUN = 'run',
	WALK = 'walk',
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
	/** Когда мы отправили запрос целевому пользователю*/
	INVITED = 'invited',
	/** Когда целевой пользователь отправил запрос нам */
	SENT = 'sent',
}

export enum SearchType {
	POSTS = 'posts',
	USERS = 'users',
}

export enum NotificationType {
	TRAINING_INVITE = 'trainig_invite',
	FRIEND_INVITE = 'friend_invite',
	/** @deprecated Пока что не используется */
	NEW_SUBSCRIBER = 'new_subscriber',
	TAGGED_IN_POST = 'tagged_in_post',
	NEW_ACHIEVEMENT = 'new_achievement',
}
