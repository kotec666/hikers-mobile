import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns'
import { capitalizeFirstLetter } from '@/helpers/capitalizeFirstLetter'
import { LngShort, locales } from '@/store/languageStorage'

export interface CalendarDay {
	date: Date
	dayNumber: string
}

export interface CalendarMonth {
	id: string
	title: string
	days: CalendarDay[]
	startOffset: number
}

export interface GeneratedMonthsResult {
	months: CalendarMonth[]
	currentMonthIndex: number
}

export const generateMonth = (date: Date, language: LngShort = LngShort.en): CalendarMonth => {
	const monthStart = startOfMonth(date)
	const monthEnd = endOfMonth(date)

	const days = eachDayOfInterval({
		start: monthStart,
		end: monthEnd
	})

	const firstDayWeekday = monthStart.getDay()

	const startOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1

	const locale = locales[language] ?? locales[LngShort.en]

	return {
		startOffset,
		id: format(date, 'yyyy-MM'),
		title: capitalizeFirstLetter(
			format(date, 'LLLL yyyy', {
				locale
			})
		),
		days: days.map((date) => ({
			date,
			dayNumber: format(date, 'd')
		}))
	}
}

export const generateMonthsRange = (
	startOffset: number,
	endOffset: number,
	language: LngShort = LngShort.en
): GeneratedMonthsResult => {
	const now = new Date()
	const months: CalendarMonth[] = []
	let currentMonthIndex = 0

	for (let i = startOffset; i <= endOffset; i++) {
		const monthDate = addMonths(now, i)

		if (i === 0) {
			currentMonthIndex = months.length
		}

		months.push(generateMonth(monthDate, language))
	}

	return {
		months,
		currentMonthIndex
	}
}

export const getMonthHeight = (month: CalendarMonth, rowHeight: number) => {
	const totalRows = Math.ceil((month.startOffset + month.days.length) / 7)
	const TITLE_HEIGHT = 12 + 28 + 20 // paddingTop + строка заголовка + mb-5
	return TITLE_HEIGHT + totalRows * rowHeight
}

export const RING_SIZE = 30
export const TEXT_ZONE_HEIGHT = 24
export const ROW_GAP = 20
export const ROW_HEIGHT = TEXT_ZONE_HEIGHT + RING_SIZE + ROW_GAP

export const WEEKDAY_I18N_KEYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] as const
