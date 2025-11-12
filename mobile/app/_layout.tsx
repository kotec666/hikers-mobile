import { useFonts } from 'expo-font'
import { Stack } from 'expo-router'
import { Colors } from '@/constants/Colors'
import './../global.css'
import { fontFamily } from '@/constants/Fonts'
import { YamapInstance } from 'react-native-yamap-plus-lite'
import { useAuthStore } from '@/store/authStore'
import { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import notifee, { EventType } from '@notifee/react-native'
import { setActiveWorkoutPauseState } from '@/store/workoutStorage'

YamapInstance.setLocale('ru_RU')
	.then(() => {
		YamapInstance.init(process.env.EXPO_PUBLIC_YAMAP_KEY || '')
			.then(() => {
				console.log('init')
			})
			.catch(console.warn)
	})
	.catch(console.warn)

// Глобальный обработчик фоновых событий (нужно для кнопок уведомлений)
notifee.onBackgroundEvent(async ({ type, detail }) => {
	if (type === EventType.ACTION_PRESS) {
		const actionId = detail.pressAction?.id

		switch (actionId) {
			case 'pause':
				setActiveWorkoutPauseState(true)
				break
			case 'resume':
				setActiveWorkoutPauseState(false)
				break
		}
	}
})

notifee.registerForegroundService((_notification) => {
	return new Promise((resolve) => {
		// console.log('[Notifee] foreground service started:', notification.id)
		// Можно выполнять любую долгую задачу, например, трекинг GPS
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
	const { isAuthenticated, checkAuth } = useAuthStore()

	useEffect(() => {
		const init = async () => {
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
		'profile/index',
		'find-people',
		'news-feed',
		'news-feed/1',
		'workout-history',
		'friends/search',
		'friends/my-friends',
		'friends/friend-requests',
		'subscribers/my-subscriptions',
		'notifications',
		'training/viewWorkout',
		'training/newTraining'
	]
	const baseRoutes = ['(tabs)/index', 'document']
	const notAuthenticatedRoutes = ['index', 'auth']

	return (
		<>
			<Stack
				screenOptions={{
					headerShown: false,
					contentStyle: {
						backgroundColor: Colors['black-0d']
					}
				}}
			>
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
				{baseRoutes.map((route) => (
					<Stack.Screen key={route} name={route} options={{ headerShown: false }} />
				))}
			</Stack>
			<NotificationProvider />
		</>
	)
}
