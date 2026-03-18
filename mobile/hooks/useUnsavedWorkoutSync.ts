import { useRef, useState, useCallback } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getNotSavedWorkouts } from '@/store/workoutStorage'
import { deleteSingleWorkout, saveSingleWorkout } from '@/helpers/saveUnsavedTraining'

type QueueItem = {
	startedAt: number
	userId?: string
	resolve?: () => void
	reject?: (e?: unknown) => void
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
			nextWorkout.resolve?.()
		} catch (e) {
			nextWorkout.reject?.(e)
		} finally {
			setSyncingIds((ids) => ids.filter((id) => id !== nextWorkout.startedAt))

			isProcessingRef.current = false

			if (syncQueueRef.current.length) {
				processQueue()
			}
		}
	}

	// const enqueueWorkoutSync = (startedAt: number) => {
	// 	if (syncQueueRef.current.some((i) => i.startedAt === startedAt) || syncingIds.includes(startedAt)) return
	//
	// 	syncQueueRef.current.push({
	// 		startedAt,
	// 		userId: user?.id
	// 	})
	//
	// 	processQueue()
	// }

	const enqueueWorkoutSync = (startedAt: number) => {
		return new Promise<void>((resolve, reject) => {
			if (syncQueueRef.current.some((i) => i.startedAt === startedAt) || syncingIds.includes(startedAt)) {
				resolve()
				return
			}

			syncQueueRef.current.push({
				startedAt,
				userId: user?.id,
				resolve,
				reject
			})

			processQueue()
		})
	}

	// const saveAll = () => {
	// 	notSavedWorkouts.forEach((w) => enqueueWorkoutSync(w.startedAt))
	// }

	const saveAll = () => {
		const promises: Promise<void>[] = notSavedWorkouts.map((w) => enqueueWorkoutSync(w.startedAt))
		return Promise.all(promises)
	}

	const deleteWorkout = async (startedAt: number) => {
		await deleteSingleWorkout(startedAt, user?.id)
		refresh()
	}

	const deleteAll = async () => {
		await Promise.all(notSavedWorkouts.map((w) => deleteSingleWorkout(w.startedAt, user?.id)))
		refresh()
	}

	// const deleteAll = () => {
	// 	notSavedWorkouts.forEach((w) => deleteUnsavedTrainingByStartedAt(w.startedAt, user?.id))
	// 	refresh()
	// }

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
