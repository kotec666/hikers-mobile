import i18n from '@/i18next/i18next'

export const formatTime = (ms: number) => {
	const totalSec = Math.floor(ms / 1000)
	const h = String(Math.floor(totalSec / 3600)).padStart(2, '0')
	const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0')
	const s = String(totalSec % 60).padStart(2, '0')
	return `${h}:${m}:${s}`
}

/**
 * Компактный формат: "2 ч 15 мин" или "45 сек"
 */
export const formatTimeFromSecondsCompact = (seconds: number | undefined): string => {
	if (seconds === undefined || seconds === null) return '-'

	const secondsText = i18n.t('measurementUnits.seconds.short')
	const minutesText = i18n.t('measurementUnits.minutes.short')
	const hoursText = i18n.t('measurementUnits.hours.short')

	if (seconds < 60) {
		return `${seconds} ${secondsText}`
	}

	const hours = Math.floor(seconds / 3600)
	const minutes = Math.floor((seconds % 3600) / 60)

	const parts = []
	if (hours > 0) parts.push(`${hours} ${hoursText}`)
	if (minutes > 0 || hours === 0) parts.push(`${minutes} ${minutesText}`)

	return parts.join(' ') || `0 ${minutesText}`
}

// 45000      -> 0:45
// 65000      -> 1:05
// 840000     -> 14:00
// 3661000    -> 01:01:01
export const formatCountdown = (ms: number) => {
	const totalSec = Math.floor(ms / 1000)

	const hours = Math.floor(totalSec / 3600)
	const minutes = Math.floor((totalSec % 3600) / 60)
	const seconds = totalSec % 60

	if (hours > 0) {
		return [
			String(hours).padStart(2, '0'),
			String(minutes).padStart(2, '0'),
			String(seconds).padStart(2, '0')
		].join(':')
	}

	return [String(minutes), String(seconds).padStart(2, '0')].join(':')
}
