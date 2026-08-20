import { YamapInstance } from 'react-native-yamap-plus'
import i18n from '@/i18next/i18next'
import { LngLong, LngShort } from '@/store/languageStorage'

export const initializeYamap = async () => {
	try {
		const currentLang = i18n.language as LngShort
		const languages = {
			[LngShort.ru]: LngLong.ru,
			[LngShort.en]: LngLong.en
		}

		await YamapInstance.setLocale(languages[currentLang])
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error)

		if (!message.includes('setLocale() should be called before initialize()')) {
			console.warn(error)
		}
	}

	try {
		await YamapInstance.init(process.env.EXPO_PUBLIC_YAMAP_KEY || '')
		console.log('Yamap initialized')
	} catch (error) {
		console.warn(error)
	}
}

export const setYamapLocale = (locale: string) => {
	void YamapInstance.setLocale(locale)
}
