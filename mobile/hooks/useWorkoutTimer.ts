import { formatTime } from '@/helpers/formatTime'
import { getWorkoutMeta } from '@/store/workoutStorage'
import { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, AppStateStatus } from 'react-native'

export const useWorkoutTimer = (isPaused: boolean) => {
	const intervalRef = useRef<null | ReturnType<typeof setInterval>>(null)
	const appStateRef = useRef(AppState.currentState)
	// Инициализируем стейт сразу, используя данные из хранилища.
	// Это важно, чтобы при перезагрузке приложения в состоянии "Пауза"
	// время отображалось корректно сразу же.
	const [elapsed, setElapsed] = useState(() => {
		const meta = getWorkoutMeta()
		if (!meta) return 0

		if (meta.isPaused && meta.lastPauseAt) {
			return meta.lastPauseAt - meta.startedAt - meta.totalPausedMs
		} else {
			return Date.now() - meta.startedAt - meta.totalPausedMs
		}
	})

	const deleteInterval = useCallback(() => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
	}, [])

	const intervalCallback = useCallback(() => {
		const meta = getWorkoutMeta()
		if (!meta) return

		let time = 0
		if (meta.lastPauseAt) {
			time = meta.lastPauseAt - meta.startedAt - meta.totalPausedMs
		} else {
			time = Date.now() - meta.startedAt - meta.totalPausedMs
		}

		console.log('workout timer')
		setElapsed(time)
	}, []) // OK если getWorkoutMeta стабильный

	// Управление интервалом по isPaused (и старт при активном приложении)
	useEffect(() => {
		if (isPaused) {
			deleteInterval()
			// Даже если пауза, обновим значение один раз, чтобы убедиться, что UI синхронизирован
			// intervalCallback() не хочу
			return
		}

		// если уже запущен — ничего не делаем
		if (intervalRef.current) {
			// но всё равно обновим сразу
			intervalCallback()
			return
		}

		// приложение должно быть active, чтобы рисовать UI таймер
		if (appStateRef.current === 'active') {
			// обновим UI сразу
			intervalCallback()
			intervalRef.current = setInterval(intervalCallback, 1000)
		}

		return () => {
			deleteInterval()
		}
	}, [isPaused, intervalCallback, deleteInterval])

	// AppState: удаляем при уходе в background, создаём при возвращении (если нужно)
	useEffect(() => {
		const sub = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
			const wasActive = appStateRef.current === 'active'
			const nowActive = nextAppState === 'active'

			// going foreground
			if (!wasActive && nowActive) {
				// не создаём дубликаты и учитываем паузу
				if (!isPaused && !intervalRef.current) {
					intervalCallback() // обновим мгновенно
					intervalRef.current = setInterval(intervalCallback, 1000)
				}
			}

			// going background
			if (wasActive && !nowActive) {
				deleteInterval()
			}

			appStateRef.current = nextAppState
		})

		return () => sub.remove()
	}, [isPaused, intervalCallback, deleteInterval])

	return {
		formatted: formatTime(elapsed),
		ms: elapsed
	}
}
