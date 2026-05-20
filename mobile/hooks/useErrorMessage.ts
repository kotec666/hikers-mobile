import { getNoun } from '@/helpers/getNoun'

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
	const symbolWord = {
		one: 'символ',
		two: 'символа',
		five: 'символов'
	}

	const getParameterNoun = (count: number) => {
		const result = getNoun(+count, symbolWord.one, symbolWord.two, symbolWord.five)
		return `${count} ${result.word}`
	}

	const ErrorMessages: IErrorMessages = {
		minLength: `Минимальная длина ${getParameterNoun(minCount)}`,
		maxLength: `Максимальная длина ${getParameterNoun(maxCount)}`,
		required: 'Обязательное поле',
		email: 'Некорректный email',
		isNumber: 'Поле может содержать только цифры',
		notNumber: 'Поле может содержать только буквы',
		passwordsNotEquals: 'Пароли не совпадают',
		optionalMin: (count: number) => {
			return `Минимальная длина ` + getParameterNoun(count)
		},
		optionalMax: (count: number) => {
			return `Максимальная длина ` + getParameterNoun(count)
		},
		customMessage: (string: string) => {
			return `${string}`
		}
	}
	return { ErrorMessages }
}
