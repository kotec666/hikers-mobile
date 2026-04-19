import { ERRORS } from '@shared/errors';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';
import { DatabaseError } from 'pg';
import { Logger } from 'nestjs-pino';

// Пример формата ошибки на поле _email:${ERRORS.INVALID_EMAIL}

type PropertyError = {
	property: string;
	message: ERRORS[];
};

const statusCodeToError = {
	400: ERRORS.BAD_REQUEST,
	401: ERRORS.UNAUTHORIZED,
	403: ERRORS.FORBIDDEN,
	404: ERRORS.NOT_FOUND,
	413: ERRORS.TOO_LARGE,
	500: ERRORS.INTERNAL,
};

export function parsePropertyMessage(message: string): PropertyError {
	const getPropertyFromMessage = (message: string): string => {
		if (message.includes(':')) {
			const prop = message.split(':')[0];
			return prop.replaceAll('_', '');
		}

		return 'unknown';
	};

	const getErrorFromMessage = (message: string): ERRORS => {
		const possiblyError: string = message.includes(':') ? message.split(':')[1] : ERRORS.UNKNOWN_ERROR;
		return Object.values(ERRORS).find((err) => String(err) === possiblyError) ?? ERRORS.UNKNOWN_ERROR;
	};

	return {
		property: getPropertyFromMessage(message),
		message: [getErrorFromMessage(message)],
	};
}
export function parsePropertyMessages(messages: string[]): PropertyError[] {
	const errors: PropertyError[] = [];
	for (const message of messages) {
		const parsedMessage = parsePropertyMessage(message);
		const propertyMessageIndex = errors.findIndex((err) => err.property === parsedMessage.property);

		if (propertyMessageIndex !== -1) {
			errors[propertyMessageIndex].message.push(...parsedMessage.message);
		} else {
			errors.push(parsedMessage);
		}
	}
	return errors;
}

@Catch(HttpException, DatabaseError, Error)
export class HttpExceptionFilter implements ExceptionFilter {
	constructor(private readonly logger: Logger) {}

	catch(exception: HttpException | DatabaseError | Error, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		// const request = ctx.getRequest<Request>();

		if (exception instanceof DatabaseError) {
			// Случай ошибки из бд
			switch (exception.code) {
				case '23505': {
					// 23505 Это ошибка дубликата значения поля. Пример: detail: 'Key (username)=(example123) already exists.'

					const statusCode = 400;

					const regexWithGroups = /\(([^)]+)\)=\(([^)]+)\)/;
					const match = exception.detail?.match(regexWithGroups);
					if (!match) break;

					// Если ошибка по нескольким полям, то считаем как общюю, а не проперти
					if (match[1].includes(', ')) {
						const error = {
							statusCode,
							message: ERRORS.ALREADY_EXISTS,
						};
						this.logger.error(JSON.stringify(error));

						return response.status(statusCode).json(error);
					}

					const message: string = `_${match[1]}:${ERRORS.ALREADY_EXISTS}`;

					const error = {
						statusCode,
						message: message.startsWith('_')
							? [parsePropertyMessage(message)]
							: (statusCodeToError[statusCode] ?? ERRORS.UNKNOWN_ERROR),
					};
					this.logger.error(JSON.stringify(error));

					return response.status(statusCode).json(error);
				}

				default: {
					break;
				}
			}
		} else if (exception instanceof HttpException) {
			// Случай если ошибка была отловлена и подготовлена заранее

			const exceptionStatus = exception.getStatus();
			const exceptionResponse = exception.getResponse() as object;

			if (Array.isArray(exceptionResponse['message'])) {
				const error = {
					statusCode: exception.getStatus(),
					message: parsePropertyMessages(exceptionResponse['message']),
				};
				this.logger.error(JSON.stringify(error));

				return response.status(exceptionStatus).json(error);
			} else {
				const message: string = exceptionResponse['message'];

				const error = {
					statusCode: exception.getStatus(),
					message: message.startsWith('_')
						? [parsePropertyMessage(message)]
						: ERRORS[message]
							? message
							: (statusCodeToError[exceptionStatus] ?? ERRORS.UNKNOWN_ERROR),
					text: exceptionStatus === 500 ? message : undefined,
				};
				this.logger.error(JSON.stringify(error));

				return response.status(exceptionStatus).json(error);
			}
		} else if (exception instanceof Error) {
			if ('status' in exception) {
				const exceptionStatus = exception.status as number;

				const error = {
					statusCode: exceptionStatus,
					message: statusCodeToError[exceptionStatus] ?? ERRORS.UNKNOWN_ERROR,
					text: exceptionStatus === 500 ? exception.stack : undefined,
				};
				this.logger.error(JSON.stringify(error));

				return response.status(exceptionStatus).json(error);
			}
		}

		this.logger.error(`Unhandled exception: ${exception}. Stack ${exception.stack}`);

		const error = {
			statusCode: 500,
			message: ERRORS.INTERNAL,
			text: `Unhandled exception: ${exception}. Stack: ${exception.stack}`,
		};
		this.logger.error(JSON.stringify(error));

		response.status(500).json(error);
	}
}
