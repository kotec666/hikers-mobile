import { addDays, addWeeks, endOfWeek, format, isAfter, isSameDay, startOfWeek } from 'date-fns'
import { ru } from 'date-fns/locale'

export const TODAY = new Date()

export const getWeek = (date: Date) => {
	const start = startOfWeek(date, {
		weekStartsOn: 1
	})

	return Array.from({ length: 7 }).map((_, index) => addDays(start, index))
}

export const getWeekRange = (date: Date) => {
	return {
		start: startOfWeek(date, {
			weekStartsOn: 1
		}),
		end: endOfWeek(date, {
			weekStartsOn: 1
		})
	}
}

export const canGoNextDay = (date: Date) => {
	return !isSameDay(date, TODAY)
}

export const canGoNextWeek = (date: Date) => {
	const nextWeek = addWeeks(date, 1)

	return !isAfter(startOfWeek(nextWeek, { weekStartsOn: 1 }), TODAY)
}

export const formatHeaderDate = (date: Date) => {
	if (isSameDay(date, TODAY)) {
		return `Сегодня, ${format(date, 'd MMMM yyyy г.', {
			locale: ru
		})}`
	}

	return format(date, 'd MMMM yyyy г.', {
		locale: ru
	})
}
