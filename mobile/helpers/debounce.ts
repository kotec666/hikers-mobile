export const debounce = (func: Function, wait: number = 500) => {
	let timeout: ReturnType<typeof setTimeout> | undefined

	return (...args: any[]) => {
		clearTimeout(timeout)
		timeout = setTimeout(() => {
			func.apply(this, args)
		}, wait)
	}
}
