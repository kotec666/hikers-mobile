export enum Event {
	TRAINING_FINISHED = 'tf',
	/** Все метрики участника тренировки были сохранены. При этом, ивент НЕ гарантирует завершение тренировки */
	ALL_PARTICIPANT_METRICS_SYNCED = 'apms',
	USER_CREATED = 'uc',
}
