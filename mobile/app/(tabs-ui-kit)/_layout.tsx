import { Tabs } from 'expo-router'

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false
				// tabBarStyle: Platform.select({
				// 	ios: {
				// 		// Use a transparent background on iOS to show the blur effect
				// 		position: 'absolute'
				// 	},
				// 	default: {}
				// })
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: 'Home',
					headerShown: false,
					tabBarStyle: { display: 'none' }
				}}
			/>
		</Tabs>
	)
}
