import { ERRORS } from '@shared/errors';
import { registerDecorator, ValidationOptions } from 'class-validator';
import { UniqueEmailValidator } from './unique-email.validator';

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
