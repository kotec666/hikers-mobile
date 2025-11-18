import * as TaskManager from 'expo-task-manager'
import { LocationObject } from 'expo-location'
import { setWorkoutItem, setWorkoutItems } from '@/store/workoutStorage'

export const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
	if (error) {
		console.error('Location task error:', error)
		return
	}

	if (data) {
		const { locations } = data as { locations: LocationObject[] | LocationObject }
		console.log('Received background locations', locations)

		if (Array.isArray(locations)) {
			setWorkoutItems(locations)
		} else {
			setWorkoutItem(locations)
		}
	}
})
