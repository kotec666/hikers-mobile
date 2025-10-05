import { ERRORS } from '@shared/errors';
import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

type PropertyError = {
	property: string;
	message: ERRORS[];
};

function parsePropertyMessage(message: string): PropertyError {
	const getPropertyFromMessage = (message: string): string => {
		return message.includes(':') ? message.split(':')[0] : 'unknown';
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

		response.status(exceptionStatus).json({
			statusCode: exception.getStatus(),
			message: Array.isArray(exceptionResponse['message'])
				? parsePropertyMessages(exceptionResponse['message'])
				: exceptionResponse['message'],
		});
	}
}
