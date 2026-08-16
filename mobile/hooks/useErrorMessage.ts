import { getNoun } from '@/helpers/getNoun'
import { useTranslation } from 'react-i18next'

export interface IErrorMessages {
	minLength: string
	maxLength: string
	required: string
	email: string
	isNumber: string
	notNumber: string
	passwordsNotEquals: string
	optionalMin: (count: number) => string
	optionalMax: (count: number) => string
	customMessage: (string: string) => string
}

export const useErrorMessage = (minCount: number = 1, maxCount: number = 100) => {
	const { t } = useTranslation()

	const symbolWord = {
		one: t('FormErrors.one'),
		two: t('FormErrors.two'),
		five: t('FormErrors.five')
	}

	const getParameterNoun = (count: number) => {
		const result = getNoun(+count, symbolWord.one, symbolWord.two, symbolWord.five)
		return `${count} ${result.word}`
	}

	const ErrorMessages: IErrorMessages = {
		minLength: `${t('FormErrors.minLength')} ${getParameterNoun(minCount)}`,
		maxLength: `${t('FormErrors.maxLength')} ${getParameterNoun(maxCount)}`,
		required: t('FormErrors.required'),
		email: t('FormErrors.email'),
		isNumber: t('FormErrors.isNumber'),
		notNumber: t('FormErrors.notNumber'),
		passwordsNotEquals: t('FormErrors.passwordsNotEquals'),
		optionalMin: (count: number) => {
			return `${t('FormErrors.minLength')} ` + getParameterNoun(count)
		},
		optionalMax: (count: number) => {
			return `${t('FormErrors.maxLength')} ` + getParameterNoun(count)
		},
		customMessage: (string: string) => {
			return `${string}`
		}
	}
	return { ErrorMessages }
}
