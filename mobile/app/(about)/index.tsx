import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, Linking, View } from 'react-native'
import Setting from '@/components/Setting'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useToast } from '@/hooks/useToast'
import { Page } from '@/components/ui/Page'
import { useTranslation } from 'react-i18next'

const AboutPage = () => {
	const { t } = useTranslation()
	const toast = useToast()
	const { push } = useSafeNavigation()

	const openLink = async (url: string) => {
		const supported = await Linking.canOpenURL(url)

		if (supported) {
			await Linking.openURL(url)
		} else {
			toast.info(`${t('ToastMessage.info.cannotOpenURL')} ${url}`)
		}
	}

	return (
		<Page>
			<Container className="gap-[20px] flex-1">
				<HeaderBack>{t('AboutPage.header')}</HeaderBack>
				<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 50 }}>
					<View className="gap-[16px]">
						<Setting title={t('AboutPage.itemsList.privacyPolicy')} onPress={() => push('/document')} />
						<Setting
							title={t('AboutPage.itemsList.personalDataProcessingPolicy')}
							onPress={() => push('/document')}
						/>
						<Setting
							title={t('AboutPage.itemsList.termsYandexMaps')}
							onPress={() => openLink('https://yandex.ru/legal/maps_api/')}
						/>
						<Setting
							title={t('AboutPage.itemsList.reportProblem')}
							onPress={() => push('/(about)/report-a-problem')}
						/>
					</View>
				</ScrollView>
			</Container>
		</Page>
	)
}

export default AboutPage
