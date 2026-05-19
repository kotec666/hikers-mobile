import { IsBoolean, IsEmail, Length } from 'class-validator';
import { HasDigit, UniqueEmail } from '@validation/property-decorators';
import { ERRORS } from '@shared/errors';
import { lengths } from '@shared/lengths';

export namespace UserDto {
	export type Entity = {
		id: string;
		name: string | null;
		username: string | null;
		avatarFilename: string | null;
	};

	export type EntityWithEmail = {
		id: string;
		name: string | null;
		username: string | null;
		avatarFilename: string | null;
		email: string | null;
		isEmailConfirmed: boolean;
	};

	export type Login = {
		email: string;
		password: string;
	};

	export class Registration {
		@UniqueEmail()
		@IsEmail(undefined, { message: `_email:${ERRORS.INVALID_EMAIL}` })
		@Length(lengths.user.email.min, lengths.user.email.max, { message: `_email:${ERRORS.INVALID_LENGTH}` })
		email: string;

		@Length(lengths.user.password.min, lengths.user.password.max, { message: `_password:${ERRORS.INVALID_LENGTH}` })
		@HasDigit()
		password: string;

		@IsBoolean({ message: `_isTermsAccepted:${ERRORS.BAD_REQUEST}` })
		isTermsAccepted: boolean;
	}
}
