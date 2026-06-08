import { addMonths, eachDayOfInterval, endOfMonth, format, startOfMonth } from 'date-fns'
import { capitalizeFirstLetter } from '@/helpers/capitalizeFirstLetter'
import { ru } from 'date-fns/locale'

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

export const generateMonth = (date: Date): CalendarMonth => {
	const monthStart = startOfMonth(date)
	const monthEnd = endOfMonth(date)

	const days = eachDayOfInterval({
		start: monthStart,
		end: monthEnd
	})

	const firstDayWeekday = monthStart.getDay()

	const startOffset = firstDayWeekday === 0 ? 6 : firstDayWeekday - 1

	return {
		startOffset,
		id: format(date, 'yyyy-MM'),
		title: capitalizeFirstLetter(
			format(date, 'LLLL yyyy', {
				locale: ru
			})
		),
		days: days.map((date) => ({
			date,
			dayNumber: format(date, 'd')
		}))
	}
}

export const generateMonthsRange = (startOffset: number, endOffset: number): GeneratedMonthsResult => {
	const now = new Date()
	const months: CalendarMonth[] = []
	let currentMonthIndex = 0

	for (let i = startOffset; i <= endOffset; i++) {
		const monthDate = addMonths(now, i)

		if (i === 0) {
			currentMonthIndex = months.length
		}

		months.push(generateMonth(monthDate))
	}

	return {
		months,
		currentMonthIndex
	}
}
