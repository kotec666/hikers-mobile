import { Controller, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { TypedRoute } from '@nestia/core';
import { UserInterceptor } from '../../common/interceptors/user.interceptor';
import { User } from '../../common/decorators/user.decorator';
import { Token } from '../token/token.dto';

@Controller('user')
@UseInterceptors(UserInterceptor)
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * @tag User
	 * @summary Get current user
	 * @security token
	 */
	@TypedRoute.Get('me')
	public async getMe(@User() user: Token.Payload) {
		return this.userService.getUser(user.id);
	}
}
