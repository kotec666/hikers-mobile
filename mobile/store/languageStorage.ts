import { createMMKV } from 'react-native-mmkv'
import { Locale, enUS, ru } from 'date-fns/locale'

export const languageStorage = createMMKV({
	id: 'language-storage'
})

const LANGUAGE_KEY = 'language'

export enum LngShort {
	en = 'en',
	ru = 'ru'
}

export enum Directions {
	ltr = 'ltr',
	rtl = 'rtl'
}

export interface Language {
	language: string
	lngShort: LngShort
	dir: Directions
	locale: Locale
}

export const supportedLanguages: Language[] = [
	{
		language: 'English',
		lngShort: LngShort.en,
		dir: Directions.ltr,
		locale: enUS
	},
	{
		language: 'Русский',
		lngShort: LngShort.ru,
		dir: Directions.ltr,
		locale: ru
	}
]

/** Сохранить выбранный пользователем язык в хранилище */
export const setLngToStorage = (lngShort: LngShort) => {
	const foundLang = supportedLanguages.find((l) => l.lngShort === lngShort)
	return languageStorage.set(LANGUAGE_KEY, JSON.stringify(foundLang))
}

export const getSavedLngInStorage = (): Language | null => {
	const storageStr = languageStorage.getString(LANGUAGE_KEY)

	if (!storageStr) {
		return null
	}

	return JSON.parse(storageStr) as Language
}
