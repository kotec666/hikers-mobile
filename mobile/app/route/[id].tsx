import React from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import MapComponent from '@/components/map/MapComponent'
import { View } from 'react-native'

const Route = () => {
	const insets = useSafeAreaInsets()

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
				<Container className="my-[20px]">
					<HeaderBack>Просмотр маршрута</HeaderBack>
				</Container>
				<MapComponent />
			</View>
		</SafeAreaProvider>
	)
}

export default Route
