import { useState } from 'react'

export const useFullscreenMap = () => {
	const [isVisible, setIsVisible] = useState(false)
	const open = () => setIsVisible(true)
	const close = () => setIsVisible(false)

	return {
		isVisible,
		open,
		close
	}
}
