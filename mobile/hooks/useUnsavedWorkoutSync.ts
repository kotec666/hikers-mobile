import { useRef, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getNotSavedWorkouts, deleteUnsavedTrainingByStartedAt } from '@/store/workoutStorage'
import { saveSingleWorkout } from '@/helpers/saveUnsavedTraining'

type QueueItem = {
	startedAt: number
	userId?: string
}

export const useUnsavedWorkoutSync = () => {
	const { user } = useAuthStore()

	const [notSavedWorkouts, setNotSavedWorkouts] = useState(getNotSavedWorkouts(user?.id))

	const [syncingIds, setSyncingIds] = useState<number[]>([])

	const syncQueueRef = useRef<QueueItem[]>([])
	const isProcessingRef = useRef(false)

	const refresh = useCallback(() => {
		setNotSavedWorkouts(getNotSavedWorkouts(user?.id))
	}, [user?.id])

	const processQueue = async () => {
		if (isProcessingRef.current) return

		const nextWorkout = syncQueueRef.current.shift()

		if (!nextWorkout) {
			isProcessingRef.current = false
			return
		}

		isProcessingRef.current = true

		setSyncingIds((ids) => [...ids, nextWorkout.startedAt])

		try {
			await saveSingleWorkout(nextWorkout.startedAt, nextWorkout.userId)
			refresh()
		} catch (e) {
			console.error('sync failed', e)
		} finally {
			setSyncingIds((ids) => ids.filter((id) => id !== nextWorkout.startedAt))

			isProcessingRef.current = false

			if (syncQueueRef.current.length) {
				processQueue()
			}
		}
	}

	const enqueueWorkoutSync = (startedAt: number) => {
		if (syncQueueRef.current.some((i) => i.startedAt === startedAt) || syncingIds.includes(startedAt)) return

		syncQueueRef.current.push({
			startedAt,
			userId: user?.id
		})

		processQueue()
	}

	const saveAll = () => {
		notSavedWorkouts.forEach((w) => enqueueWorkoutSync(w.startedAt))
	}

	const deleteWorkout = (startedAt: number) => {
		deleteUnsavedTrainingByStartedAt(startedAt, user?.id)
		refresh()
	}

	const deleteAll = () => {
		notSavedWorkouts.forEach((w) => deleteUnsavedTrainingByStartedAt(w.startedAt, user?.id))

		refresh()
	}

	return {
		notSavedWorkouts,
		syncingIds,
		enqueueWorkoutSync,
		saveAll,
		deleteWorkout,
		deleteAll,
		refresh
	}
}
