import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { validate } from 'uuid';

export const IsUUID = createParamDecorator((data: string, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const paramValue = request.params[data];

	if (!validate(paramValue)) {
		throw new BadRequestException();
	}
});
