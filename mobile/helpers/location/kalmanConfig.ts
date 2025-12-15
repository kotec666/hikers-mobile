import { TrainingType } from '@shared/enums'

export const EKF_PARAMS_BY_ACTIVITY = {
	[TrainingType.WALK]: {
		processNoise: 0.6,
		minAccuracy: 6,
		maxSpeed: 2.2 // ~8 км/ч
	},
	[TrainingType.RUN]: {
		processNoise: 1,
		minAccuracy: 5,
		maxSpeed: 6 // ~22 км/ч
	},
	[TrainingType.TRACK]: {
		processNoise: 1.6,
		minAccuracy: 4,
		maxSpeed: 8 // ~28,8 км/ч
	},
	[TrainingType.BICYCLE]: {
		processNoise: 2.8,
		minAccuracy: 6,
		maxSpeed: 15 // ~54 км/ч
	}
}
