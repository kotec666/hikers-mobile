import { TFunction } from 'i18next'

// @TODO перевод проверить можно ли в подобных функциях использовать import i18n from '@/i18next/i18next' -> i18n.t('Namespace.text')
export const formatBackendPace = (t: TFunction<'translation', undefined>, seconds?: number | null): string => {
	if (!seconds || seconds <= 0) return '-'

	const mins = Math.floor(seconds / 60)
	const secs = Math.round(seconds % 60)

	const paddedMins = String(mins).padStart(2, '0')
	const paddedSecs = String(secs).padStart(2, '0')

	return `${paddedMins}’${paddedSecs}”/${t('measurementUnits.km.short')}`
}
