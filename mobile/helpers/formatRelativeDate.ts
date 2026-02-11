import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export const formatRelativeDate = (dateString?: string | null) => {
	if (!dateString) return '-'
	const date = new Date(dateString)
	return formatDistanceToNow(date, {
		addSuffix: true,
		locale: ru
	})
}
