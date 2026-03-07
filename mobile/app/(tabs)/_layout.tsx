import { Tabs, Stack, Redirect } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { NotificationProvider } from '@/components/providers/NotificationProvider'
import { Platform } from 'react-native'
import NativeTabsComponent from '@/components/ui/Navbar/NativeTabsComponent'
import NavBar from '@/components/ui/Navbar/NavBar'
import { Colors } from '@/constants/Colors'

const AppNavigator = (props: { isAuthenticated: boolean }) => {
	return (
		<Tabs
			initialRouteName="profile"
			screenOptions={{
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
			<Stack.Protected guard={props.isAuthenticated}>
				<Tabs.Screen name="profile" />
				<Tabs.Screen name="posts" />
				<Tabs.Screen name="newTraining" />
			</Stack.Protected>
		</Tabs>
	)
}

const Root = ({ isIOS26OrHigher, isAuthenticated }: { isIOS26OrHigher: boolean; isAuthenticated: boolean }) => {
	return (
		<>
			{/*<NotificationProvider />*/}
			{isIOS26OrHigher ? <NativeTabsComponent /> : <AppNavigator isAuthenticated={isAuthenticated} />}
		</>
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

	return (
		<>
			<Root isIOS26OrHigher={isIOS26OrHigher} isAuthenticated={isAuthenticated} />
		</>
	)
}
