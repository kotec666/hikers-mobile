import { Length } from 'class-validator';
import { ERRORS } from '@shared/errors';
import { EMAIL_CONFIRMATION_CODE_SIZE } from '@shared/constants';

export namespace AuthDto {
	export class ConfirmEmail {
		@Length(EMAIL_CONFIRMATION_CODE_SIZE, EMAIL_CONFIRMATION_CODE_SIZE, {
			message: `_code:${ERRORS.INVALID_LENGTH}`,
		})
		code: string;
	}
}
