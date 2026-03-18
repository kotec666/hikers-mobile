/**
 * Компактный формат: "2 ч 15 мин"
 */

export const formatTimeFromSecondsCompact = (seconds: number | undefined): string => {
	if (!seconds && seconds !== 0) return '-'

	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)

	const parts = []
	if (hours > 0) parts.push(`${hours} ч`)
	if (minutes > 0 || hours === 0) parts.push(`${minutes} мин`)

	return parts.join(' ') || '0 мин'
}
