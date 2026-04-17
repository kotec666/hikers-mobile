import { useEffect } from 'react'
import { useSharedValue, withTiming } from 'react-native-reanimated'
import { usePathname } from 'expo-router'

/**
 * Возвращает Animated.SharedValue для скрытия/показа NavBar
 * @param hideRoutes массив маршрутов, на которых NavBar скрыт
 */
export function useNavBarVisibility(hideRoutes: string[] = ['/newTraining']) {
	const pathname = usePathname()
	const hidden = useSharedValue(0) // 0 — показать, 1 — скрыть

	useEffect(() => {
		const shouldHide = hideRoutes.some((route) => pathname.startsWith(route))
		hidden.value = withTiming(shouldHide ? 1 : 0, { duration: 300 })
	}, [pathname, hideRoutes, hidden])

	return hidden
}
