import { StyleSheet, View, SafeAreaView } from 'react-native'
import SneakerSvg from '@/components/svg/SneakerSvg'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { MapActionButton } from '@/components/map/MapActionButton'
import MapComponent from '@/components/map/MapComponent'
import { StartButton } from '@/components/map/StartButton'
import HeaderBack from '@/components/ui/HeaderBack'
import { Container } from '@/components/ui/Container'
import { useRouter } from 'expo-router'

export default function NewTraining() {
	const router = useRouter()
	const insets = useSafeAreaInsets()
	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<SafeAreaView style={styles.container}>
				<Container>
					<HeaderBack className="my-[20px]">Новая тренировка</HeaderBack>
				</Container>
				<MapComponent />
				<View
					style={{
						bottom: insets.bottom + 35,
						zIndex: 1000
					}}
					pointerEvents="box-none"
					className="-translate-x-[50%] left-[50%] absolute flex-row justify-around items-center w-full"
				>
					<MapActionButton onPress={() => router.navigate('/')}>
						<SneakerSvg />
					</MapActionButton>
					<StartButton>Начать</StartButton>
					<MapActionButton onPress={() => router.navigate('/find-people')}>
						<PeopleAddSvg />
					</MapActionButton>
				</View>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		position: 'relative'
	}
})
