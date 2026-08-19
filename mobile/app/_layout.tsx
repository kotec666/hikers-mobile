import i18n from '@/i18next/i18next'
import { useFonts } from 'expo-font'
import { Stack, SplashScreen } from 'expo-router'
import { fontFamily } from '@/constants/Fonts'
import { YamapInstance } from 'react-native-yamap-plus'
import { useAuthStore } from '@/store/authStore'
import { useEffect } from 'react'
import InAppNotificationProvider from '@/components/providers/InAppNotificationProvider'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import PortalProvider from '@/components/Portal/PortalProvider'
import { Colors } from '@/constants/Colors'
import { QueryClientProvider } from '@tanstack/react-query'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { clearExpiredTimers } from '@/store/timerStorage'
import { runWorkoutStorageMigrations } from '@/store/workoutVersioning'
import { workoutStorage } from '@/store/workoutStorage'
import { KeyboardProvider } from 'react-native-keyboard-controller'
import { queryClient } from '@/queries/queryClient'
import { initializeWorkoutAutoFinishNotifications } from '@/services/workoutAutoFinishNotifications'
import { LngLong, LngShort } from '@/store/languageStorage'
import './../global.css'
import { Platform } from 'react-native'

SplashScreen.preventAutoHideAsync()

const initializeYamap = async () => {
	try {
		const currentLang = i18n.language as LngShort
		const languages = {
			[LngShort.ru]: LngLong.ru,
			[LngShort.en]: LngLong.en
		}

		await YamapInstance.setLocale(languages[currentLang])
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)

		if (!message.includes('setLocale() should be called before initialize()')) {
			console.warn(error)
		}
	}

	try {
		await YamapInstance.init(process.env.EXPO_PUBLIC_YAMAP_KEY || '')
		console.log('Yamap initialized')
	} catch (error) {
		console.warn(error)
	}
}

void initializeYamap()

// Глобальный обработчик фоновых событий (нужно для кнопок уведомлений)
// notifee.onBackgroundEvent(async ({ type, detail }) => {
// 	if (type === EventType.ACTION_PRESS) {
// 		const actionId = detail.pressAction?.id
// 		const user = (await getItem('authData'))?.user
//
// 		switch (actionId) {
// 			case 'pause':
// 				setActiveWorkoutPauseState(true, user?.id)
// 				break
// 			case 'resume':
// 				setActiveWorkoutPauseState(false, user?.id)
// 				break
// 		}
// 	}
// })
// notifee.registerForegroundService(() => {
// 	return new Promise(() => {})
// })

const Root = ({ isAuthenticated }: { isAuthenticated: boolean }) => {
	const isIOS = Platform.OS === 'ios'

	return (
		<QueryClientProvider client={queryClient}>
			<GestureHandlerRootView className="flex-1">
				<PortalProvider>
					<KeyboardProvider>
						<SafeAreaProvider>
							<Stack
								screenOptions={{
									headerShown: false,
									contentStyle: {
										backgroundColor: Colors['black-0d']
									}
								}}
								initialRouteName={isAuthenticated ? '(tabs)' : 'index'}
							>
								<Stack.Protected guard={isAuthenticated}>
									<Stack.Screen name="(tabs)" options={{ animation: isIOS ? 'fade' : 'none' }} />
									<Stack.Screen name="find-people" />
									<Stack.Screen name="posts/members/[id]" />
									<Stack.Screen name="posts/[id]" />
									<Stack.Screen name="workout-history" />
									<Stack.Screen name="friends/my-friends" />
									<Stack.Screen name="friends/friend-requests" />
									<Stack.Screen name="subscribers/my-subscribers" />
									<Stack.Screen name="subscribers/my-subscriptions" />
									<Stack.Screen name="notifications" />
									<Stack.Screen name="profile/edit" />
									<Stack.Screen name="profile/editActivity" />
									<Stack.Screen name="user/achievements/[id]" />
									<Stack.Screen name="achievements" />
									<Stack.Screen name="user/profile/[id]" />
									<Stack.Screen name="training/viewWorkout" />
									<Stack.Screen name="(about)/index" />
									<Stack.Screen name="(about)/report-a-problem" />
									<Stack.Screen name="(settings)/index" />
									<Stack.Screen name="(settings)/in-app-notifications" />
									{/*<Stack.Screen name="friends/search" /> не используется*/}
									{/*<Stack.Screen name="find-people" /> не используется*/}
								</Stack.Protected>

								<Stack.Protected guard={!isAuthenticated}>
									<Stack.Screen name="index" />
									<Stack.Screen name="auth" />
									<Stack.Screen name="(password-restore)/firstStep" />
									<Stack.Screen name="(password-restore)/secondStep" />
									<Stack.Screen name="(password-restore)/thirdStep" />
								</Stack.Protected>
							</Stack>
						</SafeAreaProvider>
					</KeyboardProvider>

					<NotificationProvider />
					<InAppNotificationProvider />
				</PortalProvider>
			</GestureHandlerRootView>
		</QueryClientProvider>
	)
}

export default function RootLayout() {
	const [loaded] = useFonts({
		[fontFamily.regular]: require('../assets/fonts/Manrope-Regular-400.otf'),
		[fontFamily.medium]: require('../assets/fonts/Manrope-Medium-500.otf'),
		[fontFamily.bold]: require('../assets/fonts/Manrope-Bold-700.otf')
	})
	const { isAuthenticated, checkAuth, isAuthChecked } = useAuthStore()
	const isReady = loaded && isAuthChecked

	useEffect(() => {
		// Апгрейд схемы workout-хранилища до актуальной версии (идемпотентно).
		// Дополнительно вызывается при первом импорте модуля workoutStorage.
		runWorkoutStorageMigrations(workoutStorage)
		clearExpiredTimers() // очистка истекших таймеров для восстановления пароля / подтверждения почты
		void initializeWorkoutAutoFinishNotifications()
	}, [])

	useEffect(() => {
		void checkAuth()
	}, [checkAuth])

	useEffect(() => {
		if (isReady) {
			SplashScreen.hideAsync()
		}
	}, [isReady])

	return isReady ? <Root isAuthenticated={isAuthenticated} /> : null
}
