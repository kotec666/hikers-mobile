/**
 *
 * Вызывает переданную ф-ю с троттлингом
 *
 **/
export function throttle<T extends (...args: any[]) => void>(fn: T, wait: number) {
	let lastCall = 0
	let timeout: NodeJS.Timeout | null = null
	let lastArgs: any[] | null = null

	return function (...args: Parameters<T>) {
		const now = Date.now()
		const remaining = wait - (now - lastCall)

		if (remaining <= 0) {
			// Сразу выполняем вызов
			lastCall = now
			fn(...args)
		} else {
			// Запоминаем последний вызов
			lastArgs = args

			if (!timeout) {
				timeout = setTimeout(() => {
					timeout = null
					lastCall = Date.now()
					if (lastArgs) fn(...lastArgs)
					lastArgs = null
				}, remaining)
			}
		}
	}
}
