import * as TaskManager from 'expo-task-manager'
import { LocationObject } from 'expo-location'
import { setWorkoutItems } from '@/store/workoutStorage'

export const LOCATION_TASK_NAME = 'background-location-task'

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
	if (error) {
		console.error('Location task error:', error)
		return
	}

	if (data) {
		const { locations } = data as { locations: LocationObject[] }
		console.log('Received background locations', locations)
		setWorkoutItems(locations)
	}
})
