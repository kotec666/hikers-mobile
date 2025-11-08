import { MMKV } from 'react-native-mmkv'
import { LocationObject } from 'expo-location'

export const workoutStorage = new MMKV({
	id: 'workout-storage'
})

const workoutStorageKey = 'WORKOUT_PROGRESS_ITEMS_LIST'

export enum LocationType {
	BACKGROUND = 'background',
	FOREGROUND = 'foreground'
}

export interface IWorkoutStorage {
	notSavedWorkouts: IWorkout[]
	activeWorkout: IWorkout | null
}

export interface IWorkout {
	startedAt: number // Date.now()
	locations: IWorkoutLocationStorageItem[]
}

export interface IWorkoutLocationStorageItem {
	rel_ts: number // workoutItem.locationObject.timestamp - startedAt таймстамп полученной локации относительно начала тренировки
	locationObject: LocationObject
	type: LocationType
	isSavedToServer: boolean
}

/**
 * Нажатие на кнопку "Начать" вызовет эту ф-ю, создает новый стор и активную тренировку
 **/
export const startAndStoreNewActiveWorkout = () => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)

	if (workoutStorageStr) {
		const parsedStorage = JSON.parse(workoutStorageStr) as IWorkoutStorage

		const updatedStorage = {
			notSavedWorkouts: parsedStorage.activeWorkout
				? [...parsedStorage.notSavedWorkouts, parsedStorage.activeWorkout]
				: parsedStorage.notSavedWorkouts,
			activeWorkout: {
				startedAt: Date.now(),
				locations: [] as IWorkoutLocationStorageItem[]
			} as IWorkout
		}

		return workoutStorage.set(workoutStorageKey, JSON.stringify(updatedStorage))
	} else {
		const newWorkoutStorage = {
			notSavedWorkouts: [] as unknown as IWorkout,
			activeWorkout: {
				startedAt: Date.now(),
				locations: [] as IWorkoutLocationStorageItem[]
			} as IWorkout
		} as unknown as IWorkoutStorage

		return workoutStorage.set(workoutStorageKey, JSON.stringify(newWorkoutStorage))
	}
}

/**
 * Сохраняет один элемент локации в активную тренировку
 **/
export const setWorkoutItem = (workoutItem: LocationObject, type: LocationType): IWorkoutLocationStorageItem => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)
	const parsedStorage = JSON.parse(workoutStorageStr!) as IWorkoutStorage

	const startedAt = parsedStorage!.activeWorkout!.startedAt // Date.now() @TODO проверить (убрать) таймзоны!
	const activeWorkoutLocations = parsedStorage!.activeWorkout!.locations
	const lastSavedRelTs = workoutItem.timestamp - startedAt

	const workoutItemToSave: IWorkoutLocationStorageItem = {
		locationObject: workoutItem,
		rel_ts: lastSavedRelTs,
		isSavedToServer: false,
		type
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
export const setWorkoutItems = (workoutItems: LocationObject[], type: LocationType) => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)
	const parsedStorage = JSON.parse(workoutStorageStr!) as IWorkoutStorage

	const startedAt = parsedStorage.activeWorkout!.startedAt // Date.now() @TODO проверить (убрать) таймзоны!
	const activeWorkoutLocations = parsedStorage.activeWorkout!.locations

	for (const workoutItem of workoutItems) {
		const lastSavedRelTs = workoutItem.timestamp - startedAt

		const workoutItemToSave = {
			rel_ts: lastSavedRelTs,
			isSavedToServer: false,
			locationObject: workoutItem,
			type
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
