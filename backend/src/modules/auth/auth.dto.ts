import { IsEmail, Length } from 'class-validator';
import { ERRORS } from '@shared/errors';
import { EMAIL_CONFIRMATION_CODE_SIZE } from '@shared/constants';
import { lengths } from '@shared/lengths';
import { HasDigit } from '@validation/property-decorators';

export namespace AuthDto {
	export class ConfirmEmail {
		@Length(EMAIL_CONFIRMATION_CODE_SIZE, EMAIL_CONFIRMATION_CODE_SIZE, {
			message: `_code:${ERRORS.INVALID_LENGTH}`,
		})
		code: string;
	}

	export class ConfirmPasswordRecovery {
		@Length(EMAIL_CONFIRMATION_CODE_SIZE, EMAIL_CONFIRMATION_CODE_SIZE, {
			message: `_code:${ERRORS.INVALID_LENGTH}`,
		})
		code: string;

		@IsEmail(undefined, { message: `_email:${ERRORS.INVALID_EMAIL}` })
		email: string;
	}

	export class PasswordRecovery {
		@Length(EMAIL_CONFIRMATION_CODE_SIZE, EMAIL_CONFIRMATION_CODE_SIZE, {
			message: `_code:${ERRORS.INVALID_LENGTH}`,
		})
		code: string;

		@IsEmail(undefined, { message: `_email:${ERRORS.INVALID_EMAIL}` })
		email: string;

		@Length(lengths.user.password.min, lengths.user.password.max, { message: `_password:${ERRORS.INVALID_LENGTH}` })
		@HasDigit()
		password: string;
	}
}
