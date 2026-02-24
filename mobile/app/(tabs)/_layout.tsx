import { Tabs, Stack, Redirect } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { useAuthStore } from '@/store/authStore'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import { Platform } from 'react-native'
import NativeTabsComponent from '@/components/ui/Navbar/NativeTabsComponent'
import NavBar from '@/components/ui/Navbar/NavBar'
import { ThemeProvider } from '@shopify/restyle'
import { ColorSchemeProvider, useColorScheme } from '@/components/providers/ColorSchemeContext'
import { darkTheme, lightTheme } from '@/constants/Theme'

const AppNavigator = (props: { isAuthenticated: boolean }) => {
	const { colorScheme } = useColorScheme()
	return (
		<ThemeProvider theme={colorScheme === 'dark' ? darkTheme : lightTheme}>
			<NotificationProvider />
			<Tabs
				initialRouteName="profile"
				screenOptions={{
					headerShown: false,
					tabBarShowLabel: false,
					tabBarStyle: { display: 'none' },
					animation: 'fade'
					// sceneStyle: {
					// 	backgroundColor: Colors['black-0d']
					// }
				}}
				tabBar={() => <NavBar />}
			>
				<Stack.Protected guard={props.isAuthenticated}>
					<Tabs.Screen name="profile" />
					<Tabs.Screen name="posts" />
					<Tabs.Screen name="newTraining" />
				</Stack.Protected>
			</Tabs>
		</ThemeProvider>
	)
}

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
				<Stack
					screenOptions={{
						contentStyle: {
							backgroundColor: Colors['black-0d']
						}
					}}
				>
					<NativeTabsComponent />
				</Stack>
				<NotificationProvider />
			</>
		)
	}

	return (
		<ColorSchemeProvider>
			<AppNavigator isAuthenticated={isAuthenticated} />
		</ColorSchemeProvider>
	)
}
