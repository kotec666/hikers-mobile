import { useState, useCallback } from 'react'
import { Href, useRouter } from 'expo-router'
import { NavigationOptions } from 'expo-router/build/global-state/routing'

export const useSafeNavigation = () => {
	const router = useRouter()
	const [isNavigating, setIsNavigating] = useState(false)

	const push = useCallback(
		(href: Href, options?: NavigationOptions) => {
			if (isNavigating) return // Если уже идёт навигация, игнорируем клик
			setIsNavigating(true)
			try {
				router.push(href, options)
			} finally {
				// Через небольшой таймаут снимаем блокировку, чтобы не было "залипаний"
				setTimeout(() => setIsNavigating(false), 500)
			}
		},
		[isNavigating, router]
	)

	return { push }
}
