// import ERRORS from '@shared/enums'; @TODO подружить шаред и докер
export enum ERRORS {
	INVALID_LENGTH = 'INVALID_LENGTH',
	INVALID_EMAIL = 'INVALID_EMAIL',
	UNKNOWN_ERROR = 'UNKNOWN_ERROR',
	MISMATCH = 'MISMATCH',
	ALREADY_CREATED = 'ALREADY_CREATED',
}

const fieldError = (key: string, errors: ERRORS[]) => ({
	property: key,
	original: {
		classValidatorLikeError: 'class validator like error',
	},
	message: errors,
});

export default fieldError;
