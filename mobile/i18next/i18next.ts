import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import { getLocales } from 'expo-localization'
import en from '@/i18next/locales/en'
import ru from '@/i18next/locales/ru'
import {
	Directions,
	getSavedLngInStorage,
	LngShort,
	setLngToStorage,
	supportedLanguages
} from '@/store/languageStorage'
import { I18nManager } from 'react-native'

export const resources = { en, ru } as const
export const defaultNS = 'translation'

const fallbackLanguage = LngShort.en

const supportedLanguagesShortNames = supportedLanguages.map((lang) => lang.lngShort)

const setRTL = (isRTL: boolean) => {
	I18nManager.allowRTL(isRTL)
	I18nManager.forceRTL(isRTL)
}

function resolveLanguage(): string {
	// 1. Check for a stored user preference
	const savedLngInStorage = getSavedLngInStorage()

	if (savedLngInStorage) {
		const isRTL = savedLngInStorage.dir === Directions.rtl
		setRTL(isRTL)
		return savedLngInStorage.lngShort
	}

	// 2. Auto-detect from device or use forced code
	const deviceLng = getLocales()[0].languageCode
	const deviceDir = getLocales()[0].textDirection

	if (deviceLng && supportedLanguagesShortNames.includes(deviceLng as LngShort)) {
		const isRTL = deviceDir === Directions.rtl
		setRTL(isRTL)
		setLngToStorage(deviceLng as LngShort) // if not stored
		return deviceLng
	}

	setLngToStorage(LngShort.en) // if not stored
	return fallbackLanguage
}

// eslint-disable-next-line
i18n.use(initReactI18next)
	.init({
		resources,
		fallbackLng: fallbackLanguage,
		defaultNS,
		lng: resolveLanguage(),
		supportedLngs: supportedLanguagesShortNames,
		interpolation: {
			escapeValue: false
		}
	})
	.then()

export default i18n
