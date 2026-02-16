import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { fontFamily } from '@/constants/Fonts'
import { YamapInstance } from 'react-native-yamap-plus'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import notifee, { EventType } from '@notifee/react-native'
import { setActiveWorkoutPauseState } from '@/store/workoutStorage'
import { getAuthData } from '@/services/tokenService'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import PortalProvider from '@/components/Portal/PortalProvider'
import { getItem } from '@/store/storage'
import './../global.css'

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

notifee.registerForegroundService((_notification) => {
	return new Promise((resolve) => {
		// console.log('[Notifee] foreground service started:', notification.id)
		resolve()
	})
})

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
		// 'news-feed/members', // для /news-feed/members
		'workout-history',
		'friends/search',
		'friends/my-friends',
		'friends/friend-requests',
		'subscribers/my-subscriptions',
		'notifications',
		'training/viewWorkout'
	]
	const baseRoutes = ['index', 'document']
	const notAuthenticatedRoutes = ['auth']

	return (
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
						<Stack.Screen key={route} name={route} options={{ headerShown: false }} />
					))}
					<Stack.Protected guard={isAuthenticated}>
						{authenticatedRoutes.map((route) => (
							<Stack.Screen key={route} name={route} options={{ headerShown: false }} />
						))}
					</Stack.Protected>
					<Stack.Protected guard={!isAuthenticated}>
						{notAuthenticatedRoutes.map((route) => (
							<Stack.Screen key={route} name={route} options={{ headerShown: false }} />
						))}
					</Stack.Protected>
				</Stack>
				<NotificationProvider />
			</PortalProvider>
		</GestureHandlerRootView>
	)
}
