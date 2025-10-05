import { ERRORS } from '@shared/errors';
import { registerDecorator, ValidationOptions } from 'class-validator';

export function HasDigit(validationOptions?: ValidationOptions) {
	return function (object: object, propertyName: string) {
		registerDecorator({
			name: 'HasDigit',
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			validator: {
				validate(value: any) {
					if (typeof value !== 'string') {
						return false;
					}

					const hasDigitRegex = /\d/;
					return hasDigitRegex.test(value);
				},
				defaultMessage() {
					return `${propertyName}:${ERRORS.DIGIT_REQUIRED}`;
				},
			},
		});
	};
}
