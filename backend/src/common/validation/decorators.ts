import { registerDecorator, ValidationOptions } from 'class-validator';
import { UniqueEmailValidator } from './unique-email.validator';
import { UserActivity } from '@shared/enums';
import { ERRORS } from '@shared/errors';
import { validate } from 'uuid';

export function IsUUID(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'IsUUID',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			async: true,
			validator: {
				validate(value: any) {
					if (typeof value !== 'string') {
						return false;
					}

					return validate(value);
				},
				defaultMessage() {
					return `_${propertyName}:${ERRORS.BAD_REQUEST}`;
				},
			},
		});
	};
}

export function HasDigit(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'HasDigit',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			async: true,
			validator: {
				validate(value: any) {
					if (typeof value !== 'string') {
						return false;
					}

					const hasDigitRegex = /\d/;
					return hasDigitRegex.test(value);
				},
				defaultMessage() {
					return `_${propertyName}:${ERRORS.DIGIT_REQUIRED}`;
				},
			},
		});
	};
}

export function UniqueEmail(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'UniqueEmail',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			async: true,
			validator: UniqueEmailValidator,
		});
	};
}

export function TypedArray(checkFn: (item: any) => boolean, validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'TypedArray',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			async: true,
			validator: {
				validate(value: any) {
					if (!Array.isArray(value)) {
						return false;
					}

					return value.length === 0 || value.every(checkFn);
				},
				defaultMessage() {
					return `_${propertyName}:${ERRORS.BAD_REQUEST}`;
				},
			},
		});
	};
}

export function isUserActivityEnumValue(item: any): boolean {
	return Object.values(UserActivity).includes(item);
}

export function isUUID(item: any): boolean {
	return validate(item);
}
