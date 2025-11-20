import { formatTime } from '@/helpers/formatTime'
import { getWorkoutMeta } from '@/store/workoutStorage'
import { useEffect, useState } from 'react'

export const useWorkoutTimer = () => {
	const [elapsed, setElapsed] = useState(0)

	useEffect(() => {
		const interval = setInterval(() => {
			const meta = getWorkoutMeta()
			if (!meta) return

			let time = 0
			if (meta.isPaused && meta.lastPauseAt) {
				time = meta.lastPauseAt - meta.startedAt - meta.totalPausedMs
			} else {
				time = Date.now() - meta.startedAt - meta.totalPausedMs
			}

			setElapsed(time)
		}, 1000)

		return () => clearInterval(interval)
	}, [])

	return {
		formatted: formatTime(elapsed),
		ms: elapsed
	}
}
