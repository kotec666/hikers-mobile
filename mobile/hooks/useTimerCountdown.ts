import { useCallback, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { getRemainingTime, TimerType } from '@/store/timerStorage'

interface IUseTimerCountdown {
	remainingSeconds: number
	isBlocked: boolean
}

export const useTimerCountdown = (type: TimerType, email?: string): IUseTimerCountdown => {
	const [state, setState] = useState<IUseTimerCountdown>({
		remainingSeconds: 0,
		isBlocked: false
	})

	useFocusEffect(
		useCallback(() => {
			if (!email) {
				setState({
					remainingSeconds: 0,
					isBlocked: false
				})

				return
			}

			const update = () => {
				const remaining = getRemainingTime(type, email)

				setState((prev) => {
					const next = {
						remainingSeconds: remaining,

						isBlocked: remaining > 0
					}

					if (prev.remainingSeconds === next.remainingSeconds && prev.isBlocked === next.isBlocked) {
						return prev
					}

					return next
				})
			}

			update()

			const interval = setInterval(update, 1000)

			return () => {
				clearInterval(interval)
			}
		}, [type, email])
	)

	return state
}
