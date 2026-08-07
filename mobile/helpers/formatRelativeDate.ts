import { formatDistanceToNow } from 'date-fns'
import { Locale, ru } from 'date-fns/locale'

export const formatRelativeDate = (justNowText: string, dateString?: string | null, locale?: Locale) => {
	if (!dateString) return '-'

	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()

	// если прошло меньше минуты
	if (diffMs < 60_000) {
		return justNowText
	}

	return formatDistanceToNow(date, {
		addSuffix: true,
		locale: locale || ru
	})
}
