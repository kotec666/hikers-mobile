import { TrainingType } from '@shared/enums'

export const KALMAN_DECAY_BY_ACTIVITY: Record<TrainingType, number> = {
	// [TrainingType.WALK]: 3,
	[TrainingType.RUN]: 6,
	[TrainingType.BICYCLE]: 11,
	[TrainingType.TRACK]: 10
} as const

export const MIN_ACCURACY_BY_ACTIVITY: Record<TrainingType, number> = {
	[TrainingType.RUN]: 3,
	[TrainingType.BICYCLE]: 5,
	[TrainingType.TRACK]: 4
} as const

export const MAX_SPEED_BY_ACTIVITY: Record<TrainingType, number> = {
	[TrainingType.RUN]: 6, // м/с ≈ 21 км/ч
	[TrainingType.BICYCLE]: 15, // м/с ≈ 54 км/ч
	[TrainingType.TRACK]: 8
}

export const JITTER_FACTOR = 1.5
