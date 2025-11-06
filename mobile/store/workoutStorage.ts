import { MMKV } from 'react-native-mmkv'

interface IWorkoutStorageItem {
	id: number
	latitude: number
	longitude: number
}

export const workoutStorage = new MMKV({
	id: 'workout-storage'
})

const workoutStorageKey = 'WORKOUT_PROGRESS_ITEMS_LIST'

export const setWorkoutItem = (workoutItem: object) => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)
	if (workoutStorageStr) {
		const parsedStorage = JSON.parse(workoutStorageStr)
		const updatedStorage = [...parsedStorage, workoutItem]
		workoutStorage.set(workoutStorageKey, JSON.stringify(updatedStorage))
	} else {
		workoutStorage.set(workoutStorageKey, JSON.stringify([workoutItem]))
	}
}

export const getAllWorkoutStorage = () => {
	const value = workoutStorage.getString(workoutStorageKey)
	return value ? JSON.parse(value) : null
}

export const getWorkoutStorageItem = (workoutItemId: number) => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)
	if (workoutStorageStr) {
		const parsedStorage = JSON.parse(workoutStorageStr)
		const foundedWorkoutStorageItem = parsedStorage.find(
			(parsedStorageItem: IWorkoutStorageItem) => parsedStorageItem.id === workoutItemId
		)
		if (!foundedWorkoutStorageItem) return null
		return foundedWorkoutStorageItem
	} else {
		return null
	}
}

export const removeAllWorkoutStorage = () => {
	workoutStorage.delete(workoutStorageKey)
}

export const removeWorkoutStorageItem = (workoutItemId: number) => {
	const workoutStorageStr = workoutStorage.getString(workoutStorageKey)
	if (workoutStorageStr) {
		const parsedStorage = JSON.parse(workoutStorageStr)
		const withoutWorkoutStorageItem = parsedStorage.filter(
			(parsedStorageItem: IWorkoutStorageItem) => parsedStorageItem.id !== workoutItemId
		)

		return workoutStorage.set(workoutStorageKey, JSON.stringify(withoutWorkoutStorageItem))
	} else {
		return null
	}
}
