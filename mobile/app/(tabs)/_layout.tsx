import { Tabs, Stack } from 'expo-router'
import NavBar from '@/components/ui/NavBar'
import { Colors } from '@/constants/Colors'
import { useAuthStore } from '@/store/authStore'
import { NotificationProvider } from '@/components/providers/NotificationProvider'

export default function TabLayout() {
	const { isAuthenticated } = useAuthStore()

	return (
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
			<NotificationProvider />
		</Tabs>
	)
}
