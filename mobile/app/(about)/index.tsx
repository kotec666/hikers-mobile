import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, Linking, View } from 'react-native'
import Setting from '@/components/Setting'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useToast } from '@/hooks/useToast'
import { Page } from '@/components/ui/Page'

const AboutPage = () => {
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
		<Page>
			<Container className="gap-[20px] flex-1">
				<HeaderBack>О приложении</HeaderBack>
				<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 50 }}>
					<View className="gap-[16px]">
						<Setting title="Политика конфиденциальности" onPress={() => push('/document')} />
						<Setting title="Политика обработки персональных данных" onPress={() => push('/document')} />
						<Setting
							title="Условия использования отдельных сервисов Яндекс карт"
							onPress={() => openLink('https://yandex.ru/legal/maps_api/')}
						/>
						<Setting title="Сообщить о проблеме" onPress={() => push('/(about)/report-a-problem')} />
					</View>
				</ScrollView>
			</Container>
		</Page>
	)
}

export default AboutPage
