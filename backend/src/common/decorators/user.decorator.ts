import type { ExecutionContext } from '@nestjs/common';
import { createParamDecorator } from '@nestjs/common';
import { UserDto } from '../../modules/user/user.dto';

export class UserDataResponse {
	id: string;
}

export type UserData = Pick<UserDto.Entity, 'id'>;

/**
 * Получения пользователя в контроллере.
 * @example async method(@User() user: UserData) {}
 * */
export const User = createParamDecorator((data: unknown, ctx: ExecutionContext): UserData => {
	const request = ctx.switchToHttp().getRequest();
	return request.user;
});
