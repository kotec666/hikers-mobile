import { addDays, addWeeks, format, isAfter, isSameDay, startOfWeek } from 'date-fns'
import i18n from '@/i18next/i18next'
import { LngShort, locales } from '@/store/languageStorage'

export const TODAY = new Date()

export const getWeek = (date: Date) => {
	const start = startOfWeek(date, {
		weekStartsOn: 1
	})

	return Array.from({ length: 7 }).map((_, index) => addDays(start, index))
}

export const canGoNextDay = (date: Date) => {
	return !isSameDay(date, TODAY)
}

export const canGoNextWeek = (date: Date) => {
	const nextWeekStart = startOfWeek(addWeeks(date, 1), {
		weekStartsOn: 1
	})

	return !isAfter(nextWeekStart, TODAY)
}

export const formatHeaderDate = (date: Date, language: LngShort = LngShort.en) => {
	const yearSuffix = i18n.t('DailyActivity.yearShortSuffix')
	const formatted =
		format(date, 'd MMMM yyyy', {
			locale: locales[language] ?? locales[LngShort.en]
		}) + yearSuffix

	if (isSameDay(date, TODAY)) {
		return `${i18n.t('common.today')}, ${formatted}`
	}

	return formatted
}
