import { Controller, Get, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserInterceptor } from 'src/common/interceptors/user.interceptor';
import { User, UserData } from 'src/common/decorators/user.decorator';
import { ProfileDto } from './profile.dto';

@Controller('profile')
@UseInterceptors(UserInterceptor)
export class ProfileController {
	constructor(private readonly service: ProfileService) {}

	/**
	 * @tag Profile
	 * @summary Профиль пользователя
	 * @security token
	 */
	@Get()
	public async getMe(@User() user: UserData): Promise<ProfileDto.Entity> {
		return await this.service.getMe(user.id);
	}
}
