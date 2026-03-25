import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { fontFamily } from '@/constants/Fonts'
import { YamapInstance } from 'react-native-yamap-plus'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import InAppNotificationProvider from '@/components/providers/InAppNotificationProvider'
import notifee, { EventType } from '@notifee/react-native'
import { setActiveWorkoutPauseState } from '@/store/workoutStorage'
import { getAuthData } from '@/services/tokenService'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import PortalProvider from '@/components/Portal/PortalProvider'
import { getItem } from '@/store/storage'
import { Colors } from '@/constants/Colors'

import './../global.css'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()

YamapInstance.setLocale('ru_RU')
YamapInstance.init(process.env.EXPO_PUBLIC_YAMAP_KEY || '')
	.then(() => {
		console.log('Yamap initialized')
	})
	.catch(console.warn)

// Глобальный обработчик фоновых событий (нужно для кнопок уведомлений)
notifee.onBackgroundEvent(async ({ type, detail }) => {
	if (type === EventType.ACTION_PRESS) {
		const actionId = detail.pressAction?.id
		const user = getItem('authData')?.user

		switch (actionId) {
			case 'pause':
				setActiveWorkoutPauseState(true, user?.id)
				break
			case 'resume':
				setActiveWorkoutPauseState(false, user?.id)
				break
		}
	}
})

// notifee.registerForegroundService((_notification) => {
// 	return new Promise((resolve) => {
// 		// console.log('[Notifee] foreground service started:', notification.id)
// 		resolve()
// 	})
// })

notifee.registerForegroundService(() => {
	return new Promise(() => {})
})

const Root = ({
	isAuthenticated,
	authenticatedRoutes,
	baseRoutes,
	notAuthenticatedRoutes
}: {
	isAuthenticated: boolean
	authenticatedRoutes: string[]
	baseRoutes: string[]
	notAuthenticatedRoutes: string[]
}) => {
	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView className="flex-1">
				<PortalProvider>
					<Stack
						screenOptions={{
							headerShown: false,
							contentStyle: {
								backgroundColor: Colors['black-0d']
							}
						}}
					>
						{baseRoutes.map((route) => (
							<Stack.Screen key={route} name={route} />
						))}

						<Stack.Protected guard={isAuthenticated}>
							{authenticatedRoutes.map((route) => (
								<Stack.Screen key={route} name={route} />
							))}
						</Stack.Protected>

						<Stack.Protected guard={!isAuthenticated}>
							{notAuthenticatedRoutes.map((route) => (
								<Stack.Screen key={route} name={route} />
							))}
						</Stack.Protected>
					</Stack>

					<NotificationProvider />
					<InAppNotificationProvider />
				</PortalProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	)
}

export default function RootLayout() {
	const [isLoading, setIsLoading] = useState(true)
	const [loaded] = useFonts({
		[fontFamily.regular]: require('../assets/fonts/Manrope-Regular-400.otf'),
		[fontFamily.medium]: require('../assets/fonts/Manrope-Medium-500.otf'),
		[fontFamily.bold]: require('../assets/fonts/Manrope-Bold-700.otf')
	})
	const { isAuthenticated, login, checkAuth } = useAuthStore()

	useEffect(() => {
		const savedAuthData = getAuthData()
		const init = async () => {
			if (savedAuthData?.accessToken && savedAuthData.user) {
				login(savedAuthData?.accessToken || '', savedAuthData?.user, savedAuthData.accessTokenExpiration)
			}
			await checkAuth()
			setIsLoading(false)
		}
		init()
	}, [])

	if (!loaded) {
		// Async font loading only occurs in development.
		return null
	}

	if (isLoading) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" />
			</View>
		)
	}

	const authenticatedRoutes = [
		'find-people',
		'posts/members/[id]',
		'posts/[id]',
		'workout-history',
		// 'friends/search', не используется
		// 'find-people', не используется
		'friends/my-friends',
		'friends/friend-requests',
		'subscribers/my-subscribers',
		'subscribers/my-subscriptions',
		'notifications',
		'profile/edit',
		'profile/editActivity',
		'user/achievements/[id]',
		'achievements',
		'user/profile/[id]',
		'training/viewWorkout'
	]
	const baseRoutes = ['index', 'document']
	const notAuthenticatedRoutes = ['auth']

	return (
		<Root
			isAuthenticated={isAuthenticated}
			authenticatedRoutes={authenticatedRoutes}
			baseRoutes={baseRoutes}
			notAuthenticatedRoutes={notAuthenticatedRoutes}
		/>
	)
}
