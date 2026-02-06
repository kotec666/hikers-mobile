import { create } from 'zustand'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { IWorkoutModeElement } from '@/components/training/NewWorkout'

export interface IMetrics {
	totalAvgSpeed: string
	totalTimeFormatted: string
	totalCalories: number
	totalDistance: string
	totalAvgPace: string
	totalHeight: number | null
}

interface IWorkoutResultsStore {
	startedAt: number | null
	metrics: IMetrics | null
	points: IWorkoutLocationStorageItem[] | null
	type: IWorkoutModeElement | null
	setStartedAt: (startedAt: number) => void
	setType: (type: IWorkoutModeElement) => void
	setMetrics: (metrics: IMetrics) => void
	setPoints: (points: IWorkoutLocationStorageItem[]) => void
	clearAll: () => void
}

export const useWorkoutResultsAfterFinishStore = create<IWorkoutResultsStore>((set, get) => ({
	startedAt: null,
	metrics: null,
	points: null,
	type: null,
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
		set({ type: null, metrics: null, points: null })
	}
}))
