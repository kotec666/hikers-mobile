import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { User } from '@decorators/user.decorator';
import { TokenDto } from '../token/token.dto';

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
	public async getMe(@User() user: TokenDto.Payload) {
		return this.userService.getUser(user.id);
	}
}
