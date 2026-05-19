import { useState, useCallback } from 'react'

import { Href, useRouter } from 'expo-router'

import { NavigationOptions } from 'expo-router/build/global-state/routing'

export const useSafeNavigation = () => {
	const router = useRouter()

	const [isNavigating, setIsNavigating] = useState(false)

	const lockNavigation = () => {
		setIsNavigating(true)

		setTimeout(() => {
			setIsNavigating(false)
		}, 500)
	}

	const push = useCallback(
		(href: Href, options?: NavigationOptions) => {
			if (isNavigating) {
				return
			}

			lockNavigation()

			router.push(href, options)
		},
		[isNavigating, router]
	)

	const replace = useCallback(
		(href: Href, options?: NavigationOptions) => {
			if (isNavigating) {
				return
			}

			lockNavigation()

			router.replace(href, options)
		},
		[isNavigating, router]
	)

	return {
		push,
		replace
	}
}
