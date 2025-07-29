import { HttpStatus } from '@nestjs/common';
import fieldError from '@helpers/fieldError';

const classValidatorLikeError = (message: ReturnType<typeof fieldError>[], status: HttpStatus) => ({
	message,
	error: 'Bad Request',
	statusCode: status,
});

export default classValidatorLikeError;
