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
	const lockRef = useRef(false)

	const valueRef = useRef(value)
	valueRef.current = value

	// синхронизация снаружи (если пропсы поменялись)
	useEffect(() => {
		setValue(initialValue)
	}, [initialValue])

	const toggle = useCallback(async () => {
		if (lockRef.current || disabled) return

		lockRef.current = true
		const prev = valueRef.current
		const next = !prev

		setIsLoading(true)
		setValue(next)

		try {
			if (prev) {
				await onDisable()
			} else {
				await onEnable()
			}

			onSuccess?.(next)
		} catch (e) {
			setValue(prev)
			onError?.(e)
		} finally {
			lockRef.current = false
			setIsLoading(false)
		}
	}, [disabled, onEnable, onDisable, onError, onSuccess])

	return {
		value,
		setValue,
		toggle,
		isLoading
	}
}
