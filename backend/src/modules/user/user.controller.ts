import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { UserInterceptor } from '../../common/interceptors/user.interceptor';
import { User } from '../../common/decorators/user.decorator';
import { TokenDto } from '../token/token.dto';

@Controller('user')
@UseInterceptors(UserInterceptor)
export class UserController {
	constructor(private readonly userService: UserService) {}

	/**
	 * @tag User
	 * @summary Get current user
	 * @security token
	 */
	@Get('me')
	public async getMe(@User() user: TokenDto.Payload) {
		return this.userService.getUser(user.id);
	}
}
