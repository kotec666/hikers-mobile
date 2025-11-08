import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ERRORS } from '@shared/errors';

export const ParseEnumArray = createParamDecorator((data: { key: string; enum: object }, ctx: ExecutionContext) => {
	const request = ctx.switchToHttp().getRequest();
	const value = request.query[data.key];

	if (!value) return [];

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
