import { ERRORS } from '@shared/errors'
import { useNotificationStore } from '@/store/notificationStore'
import { NotificationInAppType } from '@/components/Notification'

type ErrorFields = {
	[key in ERRORS]: { field: string; message: string }
}

/* prettier-ignore */
/**
 *
 *  variant for personal fields
 *
 * */

const errorFields: ErrorFields = {
	[ERRORS.BAD_REQUEST]: { field: 'field_name', message: 'bad request' },
	[ERRORS.INTERNAL]: { field: 'field_name', message: 'Непредвиденная ошибка сервера' },
	[ERRORS.MISMATCH]: { field: 'password', message: 'Неверный пароль' },
	[ERRORS.DIGIT_REQUIRED]: { field: 'password', message: 'Поле должно содержать цифры' },
	[ERRORS.ALREADY_CREATED]: {
		field: 'email',
		message: 'Такой email уже зарегистрирован'
	},
	[ERRORS.INVALID_EMAIL]: {
		field: 'email',
		message: 'Некорректный email'
	},
	[ERRORS.ALREADY_EXISTS]: { field: 'email', message: 'Такой email уже зарегистрирован' },
	[ERRORS.EMAIL_ALREADY_CONFIRMED]: { field: 'email', message: 'email уже подтвержден' },
	[ERRORS.NOT_FOUND]: {
		field: 'field_name',
		message: 'Не найдено'
	},
	[ERRORS.INVALID_LENGTH]: {
		field: 'field_name',
		message: 'Неверная длина'
	},
	[ERRORS.UNKNOWN_ERROR]: {
		field: 'field_name',
		message: 'Непредвиденная ошибка'
	},
	[ERRORS.FORBIDDEN]: {
		field: 'field_name',
		message: 'Нет доступа'
	},
	[ERRORS.UNAUTHORIZED]: {
		field: 'field_name',
		message: 'Не авторизован'
	},
	[ERRORS.TIMEOUT_EXPIRED]: {
		field: 'field_name',
		message: 'TIMEOUT_EXPIRED'
	},
	[ERRORS.USER_IN_NOT_FINISHED_TRAINING]: {
		field: 'field_name',
		message: 'Невозможно начать тренировку, пока предыдущая не закончилась'
	},
	[ERRORS.USER_IS_TRAINING_PARTICIPANT]: {
		field: 'field_name',
		message: 'Невозможно начать тренировку, вы уже в составе другой тренировки'
	},
	[ERRORS.USER_IS_NOT_TRAINING_PARTICIPANT]: {
		field: 'field_name',
		message: 'Невозможно начать тренировку, вы не являетесь её участником'
	},
	[ERRORS.DATE_IN_THE_PAST]: {
		field: 'field_name',
		message: 'DATE_IN_THE_PAST'
	},
	[ERRORS.DATE_IN_THE_FUTURE]: {
		field: 'field_name',
		message: 'DATE_IN_THE_FUTURE'
	},
	[ERRORS.TOO_LARGE]: {
		field: 'field_name',
		message: 'Слишком большой размер файла'
	},
	[ERRORS.TRAINING_ALREADY_FINISHED]: {
		field: 'field_name',
		message: 'Тренировка уже завершена'
	},
	[ERRORS.TRAINING_ALREADY_STARTED]: {
		// , TRAINING_NOT_STARTED
		field: 'field_name',
		message: 'Тренировка уже начата'
	},
	[ERRORS.TRAINING_NOT_FINISHED]: {
		field: 'field_name',
		message: 'Тренировка не завершена'
	},
	[ERRORS.TRAINING_NOT_STARTED]: {
		field: 'field_name',
		message: 'Тренировка не начата'
	},
	[ERRORS.SHOULD_BE_DIFFERENT]: {
		field: 'field_name',
		message: 'Значения должны отличаться'
	},
	[ERRORS.TOO_MANY_REQUESTS]: {
		field: 'field_name',
		message: 'Слишком много попыток'
	},
	[ERRORS.EMAIL_DOMAIN_NOT_ALLOWED]: {
		field: 'field_name',
		message: 'Почтовый домен не разрешен'
	}
}
/* prettier-ignore */

/* prettier-ignore */
/**
 *
 *  new variant with unification errors
 *
 * */

type PersonalErrorFields = {
	[key: string]: {
		[key in ERRORS]?: string
	}
}

const personalErrorFields: PersonalErrorFields = {
	code: {
		[ERRORS.MISMATCH]: 'Неверный код.'
	},
	trainingId: {
		[ERRORS.MISMATCH]: 'Некорректный id тренировки'
	},
	activities: {
		[ERRORS.BAD_REQUEST]: 'Невалидный формат строки активностей'
	},
	avatarFilename: {
		[ERRORS.BAD_REQUEST]: 'Невалидный формат аватара'
	},
	id: {
		[ERRORS.MISMATCH]: 'Некорректный id',
		[ERRORS.BAD_REQUEST]: 'Передан некорректный id'
	},
	userId: {
		[ERRORS.MISMATCH]: 'Некорректный формат id'
	},
	type: {
		[ERRORS.MISMATCH]: 'Передан несуществующий тип тренировки'
	},
	colorHex: {
		[ERRORS.MISMATCH]: 'Передан неверный hex цвета'
	},
	ts: {
		[ERRORS.BAD_REQUEST]: 'Некорректный timestamp, должно быть числом',
		[ERRORS.DATE_IN_THE_FUTURE]: 'Некорректный timestamp, указано в будущем времени',
		[ERRORS.DATE_IN_THE_PAST]: 'Некорректный timestamp, дата финиша раньше даты старта'
	},
	files: {
		[ERRORS.BAD_REQUEST]: 'Передан некорректный файл'
	},
	deletedFilenames: {
		[ERRORS.BAD_REQUEST]: 'Некорректный формат удаленных изображений',
		[ERRORS.MISMATCH]: 'Изображение для удаления не прикреплено к посту'
	},
	email: {
		[ERRORS.NOT_FOUND]: 'Такой email не зарегистрирован',
		[ERRORS.INVALID_EMAIL]: 'Некорректный email',
		[ERRORS.ALREADY_EXISTS]: 'Такой email уже зарегистрирован',
		[ERRORS.EMAIL_ALREADY_CONFIRMED]: 'Этот email уже подтвержден',
		[ERRORS.EMAIL_DOMAIN_NOT_ALLOWED]: 'Доступны только ру-почты'
	},
	password: {
		[ERRORS.DIGIT_REQUIRED]: 'Пароль должен содержать цифры',
		[ERRORS.MISMATCH]: 'Неверный пароль',
		[ERRORS.SHOULD_BE_DIFFERENT]: 'Пароль должен отличаться от старого'
	},
	confirmPassword: {
		[ERRORS.MISMATCH]: 'Пароли не совпадают',
		[ERRORS.DIGIT_REQUIRED]: 'Пароль должен содержать цифры'
	},
	username: {
		[ERRORS.ALREADY_EXISTS]: 'Такой логин уже используется'
	}
}
/* prettier-ignore */

// type ErrorFields = {
// 	[key: string]: { field: string; message: string }
// }

type ErrorObjectArr = {
	message: {
		property: string
		original: {
			classValidatorLikeError: string
		}
		message: string[]
	}[]
	error: string
	statusCode: number
}

type ErrorObject = {
	message: string
	statusCode: number
}

export type FieldErrors = Record<string, string | boolean>

const isParsedErrorObject = (value: unknown): value is ErrorObject | ErrorObjectArr => {
	if (!value || typeof value !== 'object') {
		return false
	}

	// у HTTPError есть response
	// у уже распарсенной ошибки response нет
	if ('response' in value) {
		return false
	}

	if (!('message' in value)) {
		return false
	}

	if (!('statusCode' in value)) {
		return false
	}

	const message = (value as any).message

	// message: string
	if (typeof message === 'string') {
		return true
	}

	// message: [{ property, message }]
	if (
		Array.isArray(message) &&
		message.every((item) => item && typeof item === 'object' && 'property' in item && Array.isArray(item.message))
	) {
		return true
	}

	return false
}

export const getFieldsErrors = async (e: unknown): Promise<FieldErrors> => {
	const { showNotification } = useNotificationStore.getState()

	if (e instanceof TypeError && e.message === 'Network request failed') {
		showNotification('Отсутствует подключение к интернету', NotificationInAppType.ERROR)
		return {
			global: true,
			message: 'Отсутствует подключение к интернету'
		}
	}

	if (e instanceof Error && e.message.includes('Request timed out')) {
		showNotification('Превышено время ожидания ответа от сервера', NotificationInAppType.ERROR)
		return {
			global: true,
			message: 'Превышено время ожидания ответа от сервера'
		}
	}

	if (typeof e === 'object' && e !== null) {
		let errorObject: ErrorObject | ErrorObjectArr | null = null

		// уже распарсенный объект
		if (isParsedErrorObject(e)) {
			errorObject = e
		}

		// fetch error
		else if ('response' in e) {
			const response = (e as any).response
			if (response?.json) {
				errorObject = await response.json().catch(() => null)
			} else {
				console.log('В response не содержится json метод')
			}
		}

		const errors: { [key: string]: string | boolean } = {}

		if (!errorObject?.message) {
			console.log('Непредвиденная ошибка ', e)
			showNotification('Непредвиденная ошибка', NotificationInAppType.ERROR)

			return {
				global: true,
				message: 'Непредвиденная ошибка'
			}
		}

		if (Array.isArray(errorObject?.message)) {
			errorObject?.message.forEach((error) => {
				const errorKey = Object.keys(errorFields).find(
					(key) => ERRORS[key as keyof typeof ERRORS] === error.message[0]
				)

				if (errorKey) {
					const fieldName = error?.property as string
					errors[fieldName] = personalErrorFields?.[fieldName]?.[errorKey as keyof typeof ERRORS] || true
				}
			})

			return errors
		} else {
			// return {
			// 	[errorFields[errorObject.message]?.field]:
			// 		errorFields[errorObject.message]?.message,
			// }

			// toast.error(
			// 	React.createElement(ToastMsg, {
			// 		message: errorFields[errorObject.message]?.message,
			// 	}),
			// 	{ icon: false },
			// )

			const errorMessage = errorFields[errorObject?.message as keyof ErrorFields]?.message

			if (errorMessage) {
				showNotification(errorMessage, NotificationInAppType.ERROR)
			}

			return {
				global: true,
				message: errorMessage
			}
		}
	}

	return {}
}

// const errorObject = {
// 	message: "NOT_EXIST",
// 	statusCode: 504,
// }
//
// const errorObject = {
// 	message: [
// 		{
// 			property: "email",
// 			original: {
// 				classValidatorLikeError: "class validator like error",
// 			},
// 			message: ["ALREADY_USING"],
// 		},
// 		{
// 			property: "code",
// 			original: {
// 				classValidatorLikeError: "class validator like error",
// 			},
// 			message: ["BAD_CODE"],
// 		},
// 	],
// 	error: "Bad Request",
// 	statusCode: 400,
// }

// const errors = getFieldsErrors(errorObject);
// console.log(JSON.stringify(getFieldsErrors(errorObject)));
// console.log(errors.code);
