import { formatDistanceToNow } from 'date-fns'
import { Locale, ru } from 'date-fns/locale'
import i18n from '@/i18next/i18next'

export const formatRelativeDate = (dateString?: string | null, locale?: Locale) => {
	if (!dateString) return '-'

	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()

	// если прошло меньше минуты
	if (diffMs < 60_000) {
		return i18n.t('common.justNowText')
	}

	return formatDistanceToNow(date, {
		addSuffix: true,
		locale: locale || ru
	})
}
