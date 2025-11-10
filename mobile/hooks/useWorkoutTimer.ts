import { useEffect, useState } from 'react'
import { getAllWorkoutStorage } from '@/store/workoutStorage'
import { formatTime } from '@/helpers/formatTime'

export const useWorkoutTimer = () => {
	const [elapsed, setElapsed] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			const { activeWorkout: active } = getAllWorkoutStorage()
			if (!active) return

			let time = 0
			if (active.isPaused && active.lastPauseAt) {
				time = active.lastPauseAt - active.startedAt - active.totalPausedMs
			} else {
				time = Date.now() - active.startedAt - active.totalPausedMs
			}

			setElapsed(time)
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	return formatTime(elapsed)
}
