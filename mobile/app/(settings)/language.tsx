import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { ScrollView, View, Text, Pressable, NativeModules, I18nManager } from 'react-native'
import { Page } from '@/components/ui/Page'
import { useTranslation } from 'react-i18next'
import { Directions, LngShort, setLngToStorage, supportedLanguages } from '@/store/languageStorage'

const SettingsLanguagePage = () => {
	const { t, i18n } = useTranslation()

	const handlePressLanguageChange = (lang: LngShort, dir: Directions) => {
		setLngToStorage(lang)

		const isRTL = dir === Directions.rtl
		if (isRTL) {
			I18nManager.allowRTL(isRTL)
			I18nManager.forceRTL(isRTL)
		}
		void i18n.changeLanguage(lang)
		if (isRTL) return NativeModules.DevSettings.reload() //@TODO мб из-за яндекс карты релоадить всегда
	}

	return (
		<Page>
			<Container className="gap-[20px] flex-1">
				<HeaderBack>{t('LanguagePage.title')}</HeaderBack>
				<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 50 }}>
					<View className="gap-[16px]">
						{supportedLanguages.map((lang) => {
							return (
								<Pressable
									key={lang.lngShort}
									onPress={() => handlePressLanguageChange(lang.lngShort, lang.dir)}
								>
									<Text className="text-white">{lang.language}</Text>
								</Pressable>
							)
						})}
					</View>
				</ScrollView>
			</Container>
		</Page>
	)
}

export default SettingsLanguagePage
