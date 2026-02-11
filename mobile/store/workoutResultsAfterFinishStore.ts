import { create } from 'zustand'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { IWorkoutModeElement } from '@/components/training/NewWorkout'

export interface IMetrics {
	totalAvgSpeed: string
	totalTimeFormatted: string
	totalCalories: number
	totalDistanceFormatted: string // в виде строки, отформатированной через helper formatDistance
	totalAvgPace: string
	totalHeight: number | null
}

interface IWorkoutResultsStore {
	startedAt: number | null
	trainingId: string | null
	metrics: IMetrics | null
	points: IWorkoutLocationStorageItem[] | null
	type: IWorkoutModeElement | null
	setTrainingId: (trainingId: string | null) => void
	setStartedAt: (startedAt: number) => void
	setType: (type: IWorkoutModeElement) => void
	setMetrics: (metrics: IMetrics) => void
	setPoints: (points: IWorkoutLocationStorageItem[]) => void
	clearAll: () => void
}

export const useWorkoutResultsAfterFinishStore = create<IWorkoutResultsStore>((set, get) => ({
	startedAt: null,
	trainingId: null,
	metrics: null,
	points: null,
	type: null,
	setTrainingId: (trainingId: string | null) => {
		set({ trainingId })
	},
	setStartedAt: (startedAt: number) => {
		set({ startedAt })
	},
	setType: (type: IWorkoutModeElement) => {
		set({ type })
	},
	setMetrics: (metrics: IMetrics) => {
		set({ metrics })
	},
	setPoints: (points: IWorkoutLocationStorageItem[]) => {
		set({ points })
	},
	clearAll: () => {
		set({ type: null, metrics: null, points: null, startedAt: null })
	}
}))
