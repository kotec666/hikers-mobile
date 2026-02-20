import { Tabs, Stack, Redirect } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { useAuthStore } from '@/store/authStore'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import { Platform } from 'react-native'
import NativeTabsComponent from '@/components/ui/Navbar/NativeTabsComponent'
import NavBar from '@/components/ui/Navbar/NavBar'

export default function TabLayout() {
	const { isAuthenticated } = useAuthStore()

	const LiquidGlassIosVersionFrom = 26
	const isIOS = Platform.OS === 'ios'
	const versionString = String(Platform.Version)
	const majorVersion = parseInt(versionString.split('.')[0], 10)

	const isIOS26OrHigher = isIOS && majorVersion >= LiquidGlassIosVersionFrom

	if (!isAuthenticated) {
		return <Redirect href="/auth" />
	}

	// если iOS 26+ → используем NativeTabs
	if (isIOS26OrHigher) {
		return (
			<>
				<NativeTabsComponent />
				<NotificationProvider />
			</>
		)
	}

	return (
		<>
			<NotificationProvider />
			<Tabs
				initialRouteName="profile"
				screenOptions={{
					// tabBarActiveTintColor: '#ff00c3', // цвет активной иконки
					// tabBarInactiveTintColor: '#727272', // цвет неактивной иконки
					headerShown: false,
					tabBarShowLabel: false,
					tabBarStyle: { display: 'none' },
					animation: 'fade',
					sceneStyle: {
						backgroundColor: Colors['black-0d']
					}
				}}
				tabBar={() => <NavBar />}
			>
				<Stack.Protected guard={isAuthenticated}>
					<Tabs.Screen name="profile" />
					<Tabs.Screen name="posts" />
					<Tabs.Screen name="newTraining" />
				</Stack.Protected>
			</Tabs>
		</>
	)
}
