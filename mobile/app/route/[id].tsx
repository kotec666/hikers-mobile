import React from 'react'
import { SafeAreaView } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import MapComponent from '@/components/map/MapComponent'

const Route = () => {
	const insets = useSafeAreaInsets()

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<SafeAreaView style={{ flex: 1 }}>
				<Container className="my-[20px]">
					<HeaderBack>Просмотр маршрута</HeaderBack>
				</Container>
				<MapComponent />
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default Route
