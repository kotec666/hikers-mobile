import { useCallback, useEffect, useRef, useState } from 'react'

interface UseOptimisticToggleParams {
	initialValue?: boolean
	onEnable: () => Promise<any>
	onDisable: () => Promise<any>
	onError?: (e: unknown) => void
	onSuccess?: (value: boolean) => void
	disabled?: boolean
}

export const useOptimisticToggle = ({
	initialValue = false,
	onEnable,
	onDisable,
	onError,
	onSuccess,
	disabled
}: UseOptimisticToggleParams) => {
	const [value, setValue] = useState(initialValue)
	const [isLoading, setIsLoading] = useState(false)

	// чтобы не ловить stale closures
	const valueRef = useRef(value)
	valueRef.current = value

	// синхронизация снаружи (если пропсы поменялись)
	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	const toggle = useCallback(async () => {
		if (isLoading || disabled) return

		const prev = valueRef.current
		const next = !prev

		setIsLoading(true)

		// optimistic update
		setValue(next)

		try {
			if (prev) {
				await onDisable()
			} else {
				await onEnable()
			}

			onSuccess?.(next)
		} catch (e) {
			// rollback
			setValue(prev)
			onError?.(e)
		} finally {
			setIsLoading(false)
		}
	}, [isLoading, disabled, onEnable, onDisable, onError, onSuccess])

	return {
		value,
		setValue,
		toggle,
		isLoading
	}
}
