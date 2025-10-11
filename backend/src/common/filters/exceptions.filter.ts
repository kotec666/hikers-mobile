import { ERRORS } from '@shared/errors';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

type PropertyError = {
	property: string;
	message: ERRORS[];
};

const statusCodeToError = {
	400: ERRORS.BAD_REQUEST,
	401: ERRORS.UNAUTHORIZED,
	403: ERRORS.FORBIDDEN,
	404: ERRORS.NOT_FOUND,
	500: ERRORS.INTERNAL,
};

function parsePropertyMessage(message: string): PropertyError {
	const getPropertyFromMessage = (message: string): string => {
		return message.includes(':') ? message.split(':')[0].slice(1) : 'unknown';
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
function parsePropertyMessages(messages: string[]): PropertyError[] {
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

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
	catch(exception: HttpException, host: ArgumentsHost) {
		const ctx = host.switchToHttp();
		const response = ctx.getResponse<Response>();
		// const request = ctx.getRequest<Request>();

		const exceptionStatus = exception.getStatus();
		const exceptionResponse = exception.getResponse() as object;

		if (Array.isArray(exceptionResponse['message'])) {
			response.status(exceptionStatus).json({
				statusCode: exception.getStatus(),
				message: parsePropertyMessages(exceptionResponse['message']),
			});
		} else {
			const message: string = exceptionResponse['message'];

			response.status(exceptionStatus).json({
				statusCode: exception.getStatus(),
				message: message.startsWith('_')
					? [parsePropertyMessage(message)]
					: (statusCodeToError[exceptionStatus] ?? ERRORS.UNKNOWN_ERROR),
			});
		}
	}
}
