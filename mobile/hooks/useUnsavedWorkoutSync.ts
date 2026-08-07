import { useCallback, useRef, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { getNotSavedWorkouts } from '@/store/workoutStorage'
import { deleteSingleWorkout, saveSingleWorkout, WorkoutSource } from '@/helpers/saveUnsavedTraining'
import { useFinishWorkoutMutation } from '@/queries/workout'
import { useTranslation } from 'react-i18next'

type QueueItem = {
	startedAt: number
	userId?: string
	resolve: () => void
	reject: (e?: unknown) => void
}

export const useUnsavedWorkoutSync = () => {
	const { t } = useTranslation()
	const { user } = useAuthStore()

	const [notSavedWorkouts, setNotSavedWorkouts] = useState(getNotSavedWorkouts(user?.id))
	const [syncingIds, setSyncingIds] = useState<number[]>([])

	const { mutateAsync: finishWorkout } = useFinishWorkoutMutation()

	const syncQueueRef = useRef<QueueItem[]>([])
	const isProcessingRef = useRef(false)

	const promisesRef = useRef<Map<number, Promise<void>>>(new Map())

	const refresh = useCallback(() => {
		setNotSavedWorkouts(getNotSavedWorkouts(user?.id))
	}, [user?.id])

	const processQueue = useCallback(async () => {
		if (isProcessingRef.current) return

		isProcessingRef.current = true

		while (syncQueueRef.current.length) {
			const nextWorkout = syncQueueRef.current.shift()
			if (!nextWorkout) break

			setSyncingIds((ids) => [...ids, nextWorkout.startedAt])

			try {
				await saveSingleWorkout(WorkoutSource.UNSAVED, nextWorkout.startedAt, finishWorkout, nextWorkout.userId)
				refresh()
				nextWorkout.resolve()
			} catch (e) {
				console.log(e)
				nextWorkout.reject(e)
			} finally {
				setSyncingIds((ids) => ids.filter((id) => id !== nextWorkout.startedAt))
				promisesRef.current.delete(nextWorkout.startedAt)
			}
		}

		isProcessingRef.current = false
	}, [finishWorkout, refresh])

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

	const enqueueWorkoutSync = useCallback(
		(startedAt: number) => {
			const existingPromise = promisesRef.current.get(startedAt)
			if (existingPromise) {
				return existingPromise
			}

			const promise = new Promise<void>((resolve, reject) => {
				syncQueueRef.current.push({
					startedAt,
					userId: user?.id,
					resolve,
					reject
				})

				void processQueue()
			})
			promisesRef.current.set(startedAt, promise)

			return promise
		},
		[processQueue, user?.id]
	)

	// const saveAll = () => {
	// 	notSavedWorkouts.forEach((w) => enqueueWorkoutSync(w.startedAt))
	// }

	const saveAll = useCallback(() => {
		const promises: Promise<void>[] = notSavedWorkouts.map((w) => enqueueWorkoutSync(w.startedAt))
		return Promise.all(promises)
	}, [enqueueWorkoutSync, notSavedWorkouts])

	const deleteWorkout = useCallback(
		async (startedAt: number) => {
			await deleteSingleWorkout(startedAt, t, user?.id)
			refresh()
		},
		[refresh, t, user?.id]
	)

	const deleteAll = useCallback(async () => {
		await Promise.all(notSavedWorkouts.map((w) => deleteSingleWorkout(w.startedAt, t, user?.id)))
		refresh()
	}, [notSavedWorkouts, refresh, t, user?.id])

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
