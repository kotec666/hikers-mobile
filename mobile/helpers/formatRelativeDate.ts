import { formatDistanceToNow } from 'date-fns'
import { ru } from 'date-fns/locale'

export const formatRelativeDate = (dateString?: string | null) => {
	if (!dateString) return '-'

	const date = new Date(dateString)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()

	// если прошло меньше минуты
	if (diffMs < 60_000) {
		return 'только что'
	}

	return formatDistanceToNow(date, {
		addSuffix: true,
		locale: ru
	})
}
