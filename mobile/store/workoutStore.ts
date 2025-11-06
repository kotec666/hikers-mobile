import { create } from 'zustand'

export enum WORKOUT_STAGE {
	NOT_STARTED,
	PROCESSING,
	PAUSED
}

interface WorkoutStore {
	workoutStage: WORKOUT_STAGE
	setWorkoutStage: (stage: WORKOUT_STAGE) => void
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
	workoutStage: WORKOUT_STAGE.NOT_STARTED,
	setWorkoutStage: (stage: WORKOUT_STAGE) => {
		set({
			workoutStage: stage
		})
	}
}))

export const workoutStore = useWorkoutStore
