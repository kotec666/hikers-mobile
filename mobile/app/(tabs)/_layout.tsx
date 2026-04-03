import { Tabs, Stack, Redirect } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { AccessibilityInfo, Platform } from 'react-native'
import NativeTabsComponent from '@/components/ui/Navbar/NativeTabsComponent'
import NavBar from '@/components/ui/Navbar/NavBar'
import { Colors } from '@/constants/Colors'
import { isLiquidGlassAvailable } from 'expo-glass-effect'

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

const Root = ({
	isLiquidGlassAvailable,
	isAuthenticated
}: {
	isLiquidGlassAvailable: boolean
	isAuthenticated: boolean
}) => {
	return <>{isLiquidGlassAvailable ? <NativeTabsComponent /> : <AppNavigator isAuthenticated={isAuthenticated} />}</>
}

export default function TabLayout() {
	const { isAuthenticated } = useAuthStore()

	if (!isAuthenticated) {
		return <Redirect href="/auth" />
	}

	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()
	return (
		<>
			<Root isLiquidGlassAvailable={isGlassAvailable} isAuthenticated={isAuthenticated} />
		</>
	)
}
