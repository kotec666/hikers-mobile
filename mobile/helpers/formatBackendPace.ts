import i18n from '@/i18next/i18next'

export const formatBackendPace = (seconds?: number | null): string => {
	if (!seconds || seconds <= 0) return '-'

	const mins = Math.floor(seconds / 60)
	const secs = Math.round(seconds % 60)

	const paddedMins = String(mins).padStart(2, '0')
	const paddedSecs = String(secs).padStart(2, '0')

	return `${paddedMins}’${paddedSecs}”/${i18n.t('measurementUnits.km.short')}`
}
