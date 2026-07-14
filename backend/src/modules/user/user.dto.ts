import { IsBoolean, IsEmail, Length, Matches } from 'class-validator';
import {
	HasDigit,
	NashEmailDomain,
	UniqueEmail,
	UniqueUsername,
	ValidEmailDomain,
} from '@validation/property-decorators';
import { ERRORS } from '@shared/errors';
import { lengths } from '@shared/lengths';

export namespace UserDto {
	export type Entity = {
		id: string;
		name: string | null;
		username: string | null;
		color: string;
		badge: string | null;
		avatarFilename: string | null;
	};

	export type EntityWithEmail = Entity & {
		email: string | null;
		isEmailConfirmed: boolean;
	};

	export type Login = {
		email: string;
		password: string;
	};

	export class Registration {
		@UniqueEmail()
		@ValidEmailDomain()
		@NashEmailDomain()
		@IsEmail(undefined, { message: `_email:${ERRORS.INVALID_EMAIL}` })
		@Length(lengths.user.email.min, lengths.user.email.max, { message: `_email:${ERRORS.INVALID_LENGTH}` })
		email: string;

		@Length(lengths.user.password.min, lengths.user.password.max, { message: `_password:${ERRORS.INVALID_LENGTH}` })
		@HasDigit()
		password: string;

		@UniqueUsername()
		@Matches(/^[a-zA-Z0-9]+$/, { message: `_username:${ERRORS.MISMATCH}` })
		@Length(lengths.user.username.min, lengths.user.username.max, { message: `_username:${ERRORS.INVALID_LENGTH}` })
		username: string;

		@IsBoolean({ message: `_isTermsAccepted:${ERRORS.BAD_REQUEST}` })
		isTermsAccepted: boolean;
	}
}
