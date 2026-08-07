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

export enum LngLong {
	en = 'en_US',
	ru = 'ru_RU'
}

export enum Directions {
	ltr = 'ltr',
	rtl = 'rtl'
}

export interface Language {
	language: string
	lngShort: LngShort
	lngLong: LngLong
	dir: Directions
}

export const locales: Record<LngShort, Locale> = {
	[LngShort.en]: enUS,
	[LngShort.ru]: ru
}

const defaultLanguage = {
	language: 'English',
	lngShort: LngShort.en,
	lngLong: LngLong.en,
	dir: Directions.ltr
}

export const supportedLanguages: Language[] = [
	defaultLanguage,
	{
		language: 'Русский',
		lngShort: LngShort.ru,
		lngLong: LngLong.ru,
		dir: Directions.ltr
	}
]

/** Сохранить выбранный пользователем язык в хранилище */
export const setLngToStorage = (lngShort: LngShort) => {
	const foundLang = supportedLanguages.find((l) => l.lngShort === lngShort)
	return languageStorage.set(LANGUAGE_KEY, JSON.stringify(foundLang))
}

export const getSavedLngInStorage = (): Language => {
	const storageStr = languageStorage.getString(LANGUAGE_KEY)

	if (!storageStr) {
		setLngToStorage(LngShort.en)
		return defaultLanguage
	}

	return JSON.parse(storageStr) as Language
}
