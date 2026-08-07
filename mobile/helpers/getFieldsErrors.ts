import { TFunction } from 'i18next'
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
	[ERRORS.BAD_REQUEST]: { field: 'field_name', message: 'ServerErrors.BAD_REQUEST' },
	[ERRORS.INTERNAL]: { field: 'field_name', message: 'ServerErrors.INTERNAL' },
	[ERRORS.MISMATCH]: { field: 'password', message: 'ServerErrors.MISMATCH' },
	[ERRORS.DIGIT_REQUIRED]: { field: 'password', message: 'ServerErrors.DIGIT_REQUIRED' },
	[ERRORS.ALREADY_CREATED]: {
		field: 'email',
		message: 'ServerErrors.ALREADY_CREATED'
	},
	[ERRORS.INVALID_EMAIL]: {
		field: 'email',
		message: 'ServerErrors.INVALID_EMAIL'
	},
	[ERRORS.ALREADY_EXISTS]: { field: 'email', message: 'ServerErrors.ALREADY_EXISTS' },
	[ERRORS.EMAIL_ALREADY_CONFIRMED]: { field: 'email', message: 'ServerErrors.EMAIL_ALREADY_CONFIRMED' },
	[ERRORS.NOT_FOUND]: {
		field: 'field_name',
		message: 'ServerErrors.NOT_FOUND'
	},
	[ERRORS.INVALID_LENGTH]: {
		field: 'field_name',
		message: 'ServerErrors.INVALID_LENGTH'
	},
	[ERRORS.UNKNOWN_ERROR]: {
		field: 'field_name',
		message: 'ServerErrors.UNKNOWN_ERROR'
	},
	[ERRORS.FORBIDDEN]: {
		field: 'field_name',
		message: 'ServerErrors.FORBIDDEN'
	},
	[ERRORS.UNAUTHORIZED]: {
		field: 'field_name',
		message: 'ServerErrors.UNAUTHORIZED'
	},
	[ERRORS.TIMEOUT_EXPIRED]: {
		field: 'field_name',
		message: 'ServerErrors.TIMEOUT_EXPIRED'
	},
	[ERRORS.USER_IN_NOT_FINISHED_TRAINING]: {
		field: 'field_name',
		message: 'ServerErrors.USER_IN_NOT_FINISHED_TRAINING'
	},
	[ERRORS.USER_IS_TRAINING_PARTICIPANT]: {
		field: 'field_name',
		message: 'ServerErrors.USER_IS_TRAINING_PARTICIPANT'
	},
	[ERRORS.USER_IS_NOT_TRAINING_PARTICIPANT]: {
		field: 'field_name',
		message: 'ServerErrors.USER_IS_NOT_TRAINING_PARTICIPANT'
	},
	[ERRORS.DATE_IN_THE_PAST]: {
		field: 'field_name',
		message: 'ServerErrors.DATE_IN_THE_PAST'
	},
	[ERRORS.DATE_IN_THE_FUTURE]: {
		field: 'field_name',
		message: 'ServerErrors.DATE_IN_THE_FUTURE'
	},
	[ERRORS.TOO_LARGE]: {
		field: 'field_name',
		message: 'ServerErrors.TOO_LARGE'
	},
	[ERRORS.TRAINING_ALREADY_FINISHED]: {
		field: 'field_name',
		message: 'ServerErrors.TRAINING_ALREADY_FINISHED'
	},
	[ERRORS.TRAINING_ALREADY_STARTED]: {
		// , TRAINING_NOT_STARTED
		field: 'field_name',
		message: 'ServerErrors.TRAINING_ALREADY_STARTED'
	},
	[ERRORS.TRAINING_NOT_FINISHED]: {
		field: 'field_name',
		message: 'ServerErrors.TRAINING_NOT_FINISHED'
	},
	[ERRORS.TRAINING_NOT_STARTED]: {
		field: 'field_name',
		message: 'ServerErrors.TRAINING_NOT_STARTED'
	},
	[ERRORS.SHOULD_BE_DIFFERENT]: {
		field: 'field_name',
		message: 'ServerErrors.SHOULD_BE_DIFFERENT'
	},
	[ERRORS.TOO_MANY_REQUESTS]: {
		field: 'field_name',
		message: 'ServerErrors.TOO_MANY_REQUESTS'
	},
	[ERRORS.EMAIL_DOMAIN_NOT_ALLOWED]: {
		field: 'field_name',
		message: 'ServerErrors.EMAIL_DOMAIN_NOT_ALLOWED'
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
		[ERRORS.MISMATCH]: 'ServerErrors.personal.code.MISMATCH'
	},
	trainingId: {
		[ERRORS.MISMATCH]: 'ServerErrors.personal.trainingId.MISMATCH'
	},
	activities: {
		[ERRORS.BAD_REQUEST]: 'ServerErrors.personal.activities.BAD_REQUEST'
	},
	avatarFilename: {
		[ERRORS.BAD_REQUEST]: 'ServerErrors.personal.avatarFilename.BAD_REQUEST'
	},
	id: {
		[ERRORS.MISMATCH]: 'ServerErrors.personal.id.MISMATCH',
		[ERRORS.BAD_REQUEST]: 'ServerErrors.personal.id.BAD_REQUEST'
	},
	userId: {
		[ERRORS.MISMATCH]: 'ServerErrors.personal.userId.MISMATCH'
	},
	type: {
		[ERRORS.MISMATCH]: 'ServerErrors.personal.type.MISMATCH'
	},
	colorHex: {
		[ERRORS.MISMATCH]: 'ServerErrors.personal.colorHex.MISMATCH'
	},
	ts: {
		[ERRORS.BAD_REQUEST]: 'ServerErrors.personal.ts.BAD_REQUEST',
		[ERRORS.DATE_IN_THE_FUTURE]: 'ServerErrors.personal.ts.DATE_IN_THE_FUTURE',
		[ERRORS.DATE_IN_THE_PAST]: 'ServerErrors.personal.ts.DATE_IN_THE_PAST'
	},
	files: {
		[ERRORS.BAD_REQUEST]: 'ServerErrors.personal.files.BAD_REQUEST'
	},
	deletedFilenames: {
		[ERRORS.BAD_REQUEST]: 'ServerErrors.personal.deletedFilenames.BAD_REQUEST',
		[ERRORS.MISMATCH]: 'ServerErrors.personal.deletedFilenames.MISMATCH'
	},
	email: {
		[ERRORS.NOT_FOUND]: 'ServerErrors.personal.email.NOT_FOUND',
		[ERRORS.INVALID_EMAIL]: 'ServerErrors.personal.email.INVALID_EMAIL',
		[ERRORS.ALREADY_EXISTS]: 'ServerErrors.personal.email.ALREADY_EXISTS',
		[ERRORS.EMAIL_ALREADY_CONFIRMED]: 'ServerErrors.personal.email.EMAIL_ALREADY_CONFIRMED',
		[ERRORS.EMAIL_DOMAIN_NOT_ALLOWED]: 'ServerErrors.personal.email.EMAIL_DOMAIN_NOT_ALLOWED'
	},
	password: {
		[ERRORS.DIGIT_REQUIRED]: 'ServerErrors.personal.password.DIGIT_REQUIRED',
		[ERRORS.MISMATCH]: 'ServerErrors.personal.password.MISMATCH',
		[ERRORS.SHOULD_BE_DIFFERENT]: 'ServerErrors.personal.password.SHOULD_BE_DIFFERENT'
	},
	confirmPassword: {
		[ERRORS.MISMATCH]: 'ServerErrors.personal.confirmPassword.MISMATCH',
		[ERRORS.DIGIT_REQUIRED]: 'ServerErrors.personal.confirmPassword.DIGIT_REQUIRED'
	},
	username: {
		[ERRORS.ALREADY_EXISTS]: 'ServerErrors.personal.username.ALREADY_EXISTS'
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

export const getFieldsErrors = async (e: unknown, t: TFunction<'translation', undefined>): Promise<FieldErrors> => {
	const { showNotification } = useNotificationStore.getState()

	if (e instanceof TypeError && e.message === 'Network request failed') {
		const message = t('ClientErrors.NO_INTERNET')
		showNotification(message, NotificationInAppType.ERROR)
		return {
			global: true,
			message
		}
	}

	if (e instanceof Error && e.message.includes('Request timed out')) {
		const message = t('ClientErrors.REQUEST_TIMEOUT')
		showNotification(message, NotificationInAppType.ERROR)
		return {
			global: true,
			message
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
			const message = t('ClientErrors.UNEXPECTED')
			showNotification(message, NotificationInAppType.ERROR)

			return {
				global: true,
				message
			}
		}

		if (Array.isArray(errorObject?.message)) {
			errorObject?.message.forEach((error) => {
				const errorKey = Object.keys(errorFields).find(
					(key) => ERRORS[key as keyof typeof ERRORS] === error.message[0]
				)

				if (errorKey) {
					const fieldName = error?.property as string
					const translationKey = personalErrorFields?.[fieldName]?.[errorKey as keyof typeof ERRORS]

					errors[fieldName] = translationKey ? t(translationKey) : true
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

			const translationKey = errorFields[errorObject?.message as keyof ErrorFields]?.message
			const errorMessage = translationKey ? t(translationKey) : undefined

			if (errorMessage) {
				showNotification(errorMessage, NotificationInAppType.ERROR)
			}

			return {
				global: true,
				message: errorMessage ?? ''
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
