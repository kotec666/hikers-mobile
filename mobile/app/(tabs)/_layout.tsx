import { Tabs } from 'expo-router'
import NavBar from '@/components/ui/NavBar'
import { Colors } from '@/constants/Colors'

export default function TabLayout() {
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
			<Tabs.Screen name="profile" />
			<Tabs.Screen name="posts" />
			<Tabs.Screen name="newTraining" />
		</Tabs>
	)
}
