import { registerDecorator, ValidationOptions } from 'class-validator';
import { UserActivity } from '@shared/enums';
import { ERRORS } from '@shared/errors';
import { validate } from 'uuid';
import { FinishedTrainingParticipantValidator, UniqueEmailValidator } from './validators';

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

export function FinishedTrainingParticipant(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'FinishedTrainingParticipant',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			async: true,
			validator: FinishedTrainingParticipantValidator,
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

export function IsHexColor(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'IsHexColor',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any): boolean {
					if (typeof value !== 'string') {
						return false;
					}

					// Проверяем, что строка начинается с # и содержит только hex-символы
					const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
					return hexColorRegex.test(value);
				},

				defaultMessage(): string {
					return `_${propertyName}:${ERRORS.MISMATCH}`;
				},
			},
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

export function IsUUIDFilename(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'IsUUUIDFilename',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			async: true,
			validator: {
				validate(value: any) {
					const strItem = String(value).split('.');
					if (strItem.length !== 2) {
						return false;
					}

					const uuidPart = strItem[0];
					const extensionPart = strItem[1];
					return isUUID(uuidPart) && extensionPart.length > 0;
				},
				defaultMessage() {
					return `_${propertyName}:${ERRORS.MISMATCH}`;
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

export function isFile(item: any): boolean {
	return item satisfies Express.Multer.File;
}

export function isUUIDFilename(item: any): boolean {
	const strItem = String(item).split('.');
	if (strItem.length !== 2) {
		return false;
	}

	const uuidPart = strItem[0];
	const extensionPart = strItem[1];
	return isUUID(uuidPart) && extensionPart.length > 0;
}
