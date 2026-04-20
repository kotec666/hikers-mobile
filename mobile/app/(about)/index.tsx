import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, Linking, View } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import Setting from '@/components/Setting'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useToast } from '@/hooks/useToast'

const AboutPage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const { push } = useSafeNavigation()

	const openLink = async (url: string) => {
		const supported = await Linking.canOpenURL(url)

		if (supported) {
			await Linking.openURL(url)
		} else {
			toast.info(`Не удалось открыть URL: ${url}`)
		}
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px] flex-1">
				<HeaderBack>О приложении</HeaderBack>
				<ScrollView
					style={{ flex: 1, width: '100%' }}
					contentContainerStyle={{ paddingBottom: insets.bottom + 50 }}
				>
					<View className="gap-[16px]">
						<Setting title="Политика конфиденциальности" onPress={() => push('/document')} />
						<Setting title="Политика обработки персональных данных" onPress={() => push('/document')} />
						<Setting
							title="Условия использования отдельных сервисов Яндекс карт"
							onPress={() => openLink('https://yandex.ru/legal/maps_api/')}
						/>
						<Setting title="Сообщить о проблеме" onPress={() => push('/(about)/report-a-problem')} />
						{/*<Setting*/}
						{/*	title={[{ text: 'Выбор своего ' }, { text: 'цвета', color: Colors['green-main'] }]}*/}
						{/*	onPress={() => push('/document')}*/}
						{/*/>*/}
					</View>
				</ScrollView>
			</Container>
			<StatusBar style="light" />
		</SafeAreaProvider>
	)
}

export default AboutPage
