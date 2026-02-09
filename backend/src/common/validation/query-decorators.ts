import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ERRORS } from '@shared/errors';
import type { Request } from 'express';

export const NotNegative = createParamDecorator((data: string, ctx: ExecutionContext) => {
	const request: Request = ctx.switchToHttp().getRequest();
	const paramValue = request.query[data] as string;

	const intValue = parseInt(paramValue);
	if (intValue < 0) {
		throw new BadRequestException(`_${data}:${ERRORS.BAD_REQUEST}`);
	}

	return Number.isNaN(intValue) ? 0 : intValue;
});
