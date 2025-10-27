import { Body, Controller, Get, Patch, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UserInterceptor } from 'src/common/interceptors/user.interceptor';
import { User, UserData } from 'src/common/decorators/user.decorator';
import { ProfileDto } from './profile.dto';
import { FileInterceptor } from '@nestjs/platform-express';

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

	/**
	 * @tag Profile
	 * @summary Редактирование профиля
	 * @security token
	 */
	@Patch()
	@UseInterceptors(FileInterceptor('avatar'))
	public async edit(
		@User() user: UserData,
		@Body() body: ProfileDto.Edit,
		@UploadedFile() avatar?: Express.Multer.File,
	): Promise<ProfileDto.Entity> {
		return await this.service.edit(user.id, {
			...body,
			avatarFilename: typeof body.avatarFilename === 'string' ? body.avatarFilename : avatar,
		});
	}
}
