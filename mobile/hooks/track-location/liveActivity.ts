import { Platform } from 'react-native'
import { TrainingType } from '@shared/enums'
import { WorkoutTypesMap } from '@/constants/WorkoutTypes'
import * as liveActivities from '@/modules/expo-live-activity'
import type { PendingWidgetAction } from '@/modules/expo-live-activity'

type WorkoutLiveActivityIcon = 'RUNNING' | 'WALKING' | 'BIKING' | 'WORKOUT'

type WorkoutWidgetActionListener = (event: PendingWidgetAction) => void

const isIOS = Platform.OS === 'ios'
let activeWorkoutLiveActivityId: string | null = null

const getWorkoutLiveActivityIcon = (workoutType: TrainingType): WorkoutLiveActivityIcon => {
	if (workoutType === TrainingType.RUN) return 'RUNNING'
	if (workoutType === TrainingType.WALK) return 'WALKING'
	if (workoutType === TrainingType.BICYCLE) return 'BIKING'

	return 'WORKOUT'
}

const getExistingActivityId = () => {
	const activeActivity = liveActivities.getActiveActivities()[0]
	return activeActivity?.id ?? null
}

const canUseLiveActivity = () => isIOS && liveActivities.isLiveActivityAvailable()

export const startWorkoutLiveActivity = async (workoutType: TrainingType): Promise<string | null> => {
	if (!canUseLiveActivity()) return null

	const existingActivityId = getExistingActivityId()
	if (existingActivityId) {
		activeWorkoutLiveActivityId = existingActivityId
		return existingActivityId
	}

	const activityId = await liveActivities.startLiveActivity(
		WorkoutTypesMap?.[workoutType]?.name ?? 'Тренировка',
		getWorkoutLiveActivityIcon(workoutType)
	)

	activeWorkoutLiveActivityId = activityId || null
	return activeWorkoutLiveActivityId
}

export const pauseWorkoutLiveActivity = async (): Promise<boolean> => {
	if (!canUseLiveActivity()) return false

	return liveActivities.pauseLiveActivity(activeWorkoutLiveActivityId ?? undefined)
}

export const resumeWorkoutLiveActivity = async (): Promise<boolean> => {
	if (!canUseLiveActivity()) return false

	return liveActivities.resumeLiveActivity(activeWorkoutLiveActivityId ?? undefined)
}

export const endWorkoutLiveActivity = async (): Promise<boolean> => {
	if (!canUseLiveActivity()) return false

	const success = await liveActivities.endLiveActivity(activeWorkoutLiveActivityId ?? undefined)
	if (success) activeWorkoutLiveActivityId = null

	return success
}

export const consumePendingWorkoutLiveActivityAction = (): PendingWidgetAction | null => {
	if (!isIOS) return null

	return liveActivities.consumePendingWidgetAction()
}

export const addWorkoutLiveActivityWidgetActionListener = (listener: WorkoutWidgetActionListener) => {
	if (!isIOS) return { remove: () => {} }

	return liveActivities.addListener('onWidgetAction', (event) => {
		listener(event as PendingWidgetAction)
	})
}

export const updateWorkoutLiveActivityFromLastLocationTimestamp = async (timestamp?: number): Promise<void> => {
	if (!canUseLiveActivity() || typeof timestamp !== 'number') return

	const success = await liveActivities.updateLiveActivityLastLocationTimestamp(
		timestamp,
		activeWorkoutLiveActivityId ?? undefined
	)

	if (!success) {
		activeWorkoutLiveActivityId = getExistingActivityId()
		if (activeWorkoutLiveActivityId) {
			await liveActivities.updateLiveActivityLastLocationTimestamp(timestamp, activeWorkoutLiveActivityId)
		}
	}
}
