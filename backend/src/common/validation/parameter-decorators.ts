import { createParamDecorator, ExecutionContext, BadRequestException } from '@nestjs/common';
import { ERRORS } from '@shared/errors';
import { validate } from 'uuid';

export const IsUUID = createParamDecorator((data: string, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const paramValue = request.params[data];

	if (!validate(paramValue)) {
		throw new BadRequestException(`_${data}:${ERRORS.NOT_FOUND}`);
	}

	return paramValue;
});

export const ParseEnumArray = createParamDecorator((data: { key: string; enum: object }, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const value = request.query[data.key];

	if (!value) return value;

	if (typeof value !== 'string') {
		throw new BadRequestException(`_${data.key}:${ERRORS.BAD_REQUEST}`);
	}

	const array = value
		.split(',')
		.map((item) => item.trim())
		.filter((item) => item !== '');

	const enumValues = Object.values(data.enum);
	const parsedArray = array.map((item) => {
		if (!enumValues.includes(item)) {
			throw new BadRequestException(`_${data.key}:${ERRORS.BAD_REQUEST}`);
		}
		return item as keyof typeof data.enum;
	});

	return parsedArray;
});

export const ParseEnum = createParamDecorator((data: { key: string; enum: object }, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const value = request.query[data.key];

	if (!value) return value;

	if (typeof value !== 'string') {
		throw new BadRequestException(`_${data.key}:${ERRORS.BAD_REQUEST}`);
	}

	const enumValues = Object.values(data.enum);
	if (!enumValues.includes(value)) {
		throw new BadRequestException(`_${data.key}:${ERRORS.BAD_REQUEST}`);
	}
	return value as keyof typeof data.enum;
});
