import { Controller, Delete, Get, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { User } from '@decorators/user.decorator';
import { TokenDto } from '../token/token.dto';
import { UserDto } from './user.dto';
import { CommonDto } from '../../common/dto/common.dto';

@Controller('user')
@UseInterceptors(UserInterceptor)
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * @tag User
	 * @summary Получить текущего юзера
	 * @security token
	 */
	@Get('me')
	public async getMe(@User() user: TokenDto.Payload): Promise<UserDto.Entity> {
		return this.userService.getUser(user.id);
	}

	/**
	 * @tag User
	 * @summary Удалить аккаунт
	 * @security token
	 */
	@Delete('me')
	public async deleteMe(@User() user: TokenDto.Payload): Promise<CommonDto.BooleanResponse> {
		return this.userService.deleteUser(user.id);
	}
}
