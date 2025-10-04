import { IsEmail, Length } from 'class-validator';
import { HasDigit } from '@validation/decorators';
import { ERRORS } from '@helpers/errors';

export namespace UserDto {
	export type Entity = {
		id: string;
		email: string;
		name: string | null;
		username: string | null;
		avatarFilename: string | null;
	};

	export type Login = {
		email: string;
		password: string;
	};

	export class Registration {
		@IsEmail(undefined, { message: `email:${ERRORS.INVALID_EMAIL}` })
		email: string;

		@Length(8, 63, { message: `password:${ERRORS.INVALID_LENGTH}` })
		@HasDigit()
		password: string;
	}
}
