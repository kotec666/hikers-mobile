import { LocationObject } from 'expo-location'
import { TrainingType } from '@shared/enums'

// Доменные типы workout-хранилища.
// Вынесены в отдельный модуль, чтобы избежать циклического импорта между
// `store/workoutStorage.ts` и `helpers/binarySerializer.ts`.

export interface IWorkout {
	id: string | null
	userId: string
	isPaused: boolean
	type: TrainingType
	startedAt: number
	totalPausedMs: number
	lastPauseAt: null | number
	distanceMeters: number
	locations: IWorkoutLocationStorageItem[]
}

export interface IWorkoutMeta {
	id: string | null
	userId: string
	isPaused: boolean
	type: TrainingType
	startedAt: number
	totalPausedMs: number
	lastPauseAt: null | number
	chunkCount: number
	nextPointId: number
	distanceMeters: number
	lastDistancePoint: IWorkoutLocationStorageItem | null
}

export interface IWorkoutLocationStorageItem {
	pointId: number
	relTs: number
	locationObject: LocationObject
	paused: boolean
	isSavedToServer: boolean
}

// Записная книжка о завершённой тренировке в JSON-списках NOT_SAVED / SHORT_WORKOUTS.
// Локации хранятся отдельно в бинарных blob-ключах (см. workoutStorage.ts),
// поэтому в списках лежит только метаданные без точек.
export type IStoredWorkoutEntry = Omit<IWorkout, 'locations'>
