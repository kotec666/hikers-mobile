import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { getRemainingTime, TimerType } from '@/store/timerStorage'

interface IUseTimerCountdown {
	remainingSeconds: number
	isBlocked: boolean
}

export const useTimerCountdown = (type: TimerType, email?: string) => {
	const [state, setState] = useState<IUseTimerCountdown>({
		remainingSeconds: 0,
		isBlocked: false
	})

	const update = useCallback(() => {
		if (!email) {
			setState({
				remainingSeconds: 0,
				isBlocked: false
			})
			return
		}

		const remaining = getRemainingTime(type, email)

		setState({
			remainingSeconds: remaining,
			isBlocked: remaining > 0
		})
	}, [type, email])

	useFocusEffect(
		useCallback(() => {
			if (!email) return

			update()

			const interval = setInterval(update, 1000)

			return () => clearInterval(interval)
		}, [email, update])
	)

	return {
		...state,
		refresh: update
	}
}
