import { formatTime } from '@/helpers/formatTime'
import { getWorkoutMeta } from '@/store/workoutStorage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

export const useWorkoutTimer = () => {
	const intervalRef = useRef<null | ReturnType<typeof setInterval>>(null)
	const appStateRef = useRef(AppState.currentState)
	const [elapsed, setElapsed] = useState(0)

	const intervalCallback = useCallback(() => {
		const meta = getWorkoutMeta()
		if (!meta) return
		if (meta.isPaused) return
		let time = 0
		if (meta.lastPauseAt) {
			time = meta.lastPauseAt - meta.startedAt - meta.totalPausedMs
		} else {
			time = Date.now() - meta.startedAt - meta.totalPausedMs
		}

		console.log('workout timer')
		setElapsed(time)
	}, [])

	useEffect(() => {
		const appStateSubscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
			if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
				// App has come to the foreground
				console.log('App has come to the foreground, create UI timer again')
				intervalRef.current = setInterval(intervalCallback, 1000)
			}
			if (appStateRef.current.match(/active/) && nextAppState === 'background') {
				console.log('App has gone to the background, clearUseWorkoutTimer')
				if (intervalRef.current) {
					clearInterval(intervalRef.current)
				}
			}
			appStateRef.current = nextAppState
		})

		return () => {
			appStateSubscription.remove()
		}
	}, [])

	useEffect(() => {
		intervalRef.current = setInterval(intervalCallback, 1000)

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
			}
		}
	}, [intervalCallback])

	return {
		formatted: formatTime(elapsed),
		ms: elapsed
	}
}
