import { MMKV } from 'react-native-mmkv'
import { LocationObject } from 'expo-location'
import { TrainingType } from '@shared/enums'

export const workoutStorage = new MMKV({
	id: 'workout-storage'
})

const workoutStorageKey = 'WORKOUT_PROGRESS_ITEMS_LIST'

export interface IWorkoutStorage {
	notSavedWorkouts: IWorkout[]
	activeWorkout: IWorkout | null
}

export interface IWorkout {
	isPaused: boolean
	type: TrainingType
	startedAt: number // Date.now()
	totalPausedMs: number
	lastPauseAt: null | number
	locations: IWorkoutLocationStorageItem[]
}

export interface IWorkoutLocationStorageItem {
	rel_ts: number // workoutItem.locationObject.timestamp - startedAt таймстамп полученной локации относительно начала тренировки
	locationObject: LocationObject
	isPausedPoint: boolean
	isSavedToServer: boolean
}

/**
 * Нажатие на кнопку "Пауза" вызовет эту ф-ю, меняет в хранилище паузу для активной тренировки
 **/
export const setActiveWorkoutPauseState = (isPaused: boolean): IWorkout | null => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)

	if (workoutStorageStr) {
		const parsedStorage = JSON.parse(workoutStorageStr) as IWorkoutStorage

		if (parsedStorage.activeWorkout) {
			let totalPausedMs = parsedStorage.activeWorkout.totalPausedMs
			if (!isPaused && parsedStorage.activeWorkout.isPaused && parsedStorage.activeWorkout.lastPauseAt) {
				const pausedFor = Date.now() - parsedStorage.activeWorkout.lastPauseAt
				totalPausedMs += pausedFor
			}

			const updatedStorage = {
				...parsedStorage,
				activeWorkout: {
					...parsedStorage.activeWorkout,
					isPaused: isPaused,
					totalPausedMs: totalPausedMs,
					lastPauseAt: isPaused ? Date.now() : null
				}
			}

			workoutStorage.set(workoutStorageKey, JSON.stringify(updatedStorage))
			return updatedStorage.activeWorkout
		}

		return null
	}

	return null
}

/**
 * Нажатие на кнопку "Начать" вызовет эту ф-ю, создает новый стор и активную тренировку
 **/
export const startAndStoreNewActiveWorkout = (type: TrainingType) => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)

	if (workoutStorageStr) {
		const parsedStorage = JSON.parse(workoutStorageStr) as IWorkoutStorage

		const updatedStorage = {
			notSavedWorkouts: parsedStorage.activeWorkout
				? [...parsedStorage.notSavedWorkouts, parsedStorage.activeWorkout]
				: parsedStorage.notSavedWorkouts,
			activeWorkout: {
				type,
				startedAt: Date.now(),
				isPaused: false,
				totalPausedMs: 0,
				lastPauseAt: null,
				locations: [] as IWorkoutLocationStorageItem[]
			} as IWorkout
		}

		return workoutStorage.set(workoutStorageKey, JSON.stringify(updatedStorage))
	} else {
		const newWorkoutStorage: IWorkoutStorage = {
			notSavedWorkouts: [] as IWorkout[],
			activeWorkout: {
				type,
				startedAt: Date.now(),
				isPaused: false,
				totalPausedMs: 0,
				lastPauseAt: null,
				locations: [] as IWorkoutLocationStorageItem[]
			} as IWorkout
		}

		return workoutStorage.set(workoutStorageKey, JSON.stringify(newWorkoutStorage))
	}
}

export const moveActiveWorkoutToNotSaved = () => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)

	if (workoutStorageStr) {
		const parsedStorage = JSON.parse(workoutStorageStr) as IWorkoutStorage

		if (parsedStorage.activeWorkout) {
			const updatedStorage = {
				notSavedWorkouts: [...(parsedStorage.notSavedWorkouts || []), parsedStorage.activeWorkout],
				activeWorkout: null
			}

			return workoutStorage.set(workoutStorageKey, JSON.stringify(updatedStorage))
		}
	}
}

/**
 * Сохраняет один элемент локации в активную тренировку
 **/
export const setWorkoutItem = (workoutItem: LocationObject): IWorkoutLocationStorageItem => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)
	const parsedStorage = JSON.parse(workoutStorageStr!) as IWorkoutStorage

	const startedAt = parsedStorage!.activeWorkout!.startedAt // Date.now()
	const activeWorkoutLocations = parsedStorage!.activeWorkout!.locations
	const lastSavedRelTs = workoutItem.timestamp - startedAt

	const workoutItemToSave: IWorkoutLocationStorageItem = {
		locationObject: workoutItem,
		rel_ts: lastSavedRelTs,
		isSavedToServer: false,
		isPausedPoint: parsedStorage.activeWorkout?.isPaused || false
	}

	const updatedStorage = {
		...parsedStorage,
		activeWorkout: { ...parsedStorage.activeWorkout, locations: [...activeWorkoutLocations, workoutItemToSave] }
	}

	workoutStorage.set(workoutStorageKey, JSON.stringify(updatedStorage))

	return workoutItemToSave
}

/**
 * Сохраняет много элементов локации в активную тренировку
 **/
export const setWorkoutItems = (workoutItems: LocationObject[]) => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)
	const parsedStorage = JSON.parse(workoutStorageStr!) as IWorkoutStorage

	const startedAt = parsedStorage.activeWorkout!.startedAt // Date.now()
	const activeWorkoutLocations = parsedStorage.activeWorkout!.locations

	for (const workoutItem of workoutItems) {
		const lastSavedRelTs = workoutItem.timestamp - startedAt

		const workoutItemToSave = {
			rel_ts: lastSavedRelTs,
			isSavedToServer: false,
			locationObject: workoutItem,
			isPausedPoint: parsedStorage.activeWorkout?.isPaused || false
		}

		activeWorkoutLocations.push(workoutItemToSave)
	}

	const updatedStorage = {
		...parsedStorage,
		activeWorkout: { ...parsedStorage.activeWorkout, locations: activeWorkoutLocations }
	}

	workoutStorage.set(workoutStorageKey, JSON.stringify(updatedStorage))
}

export const getAllWorkoutStorage = (): IWorkoutStorage => {
	const value = workoutStorage.getString(workoutStorageKey)

	if (value) {
		return JSON.parse(value)
	}

	const newStorage = {
		notSavedWorkouts: [] as IWorkout[],
		activeWorkout: null
	}
	workoutStorage.set(workoutStorageKey, JSON.stringify(newStorage))

	return newStorage
}

export const removeAllWorkoutStorage = () => {
	workoutStorage.delete(workoutStorageKey)
}
