import {
	BadRequestException,
	Body,
	Controller,
	Get,
	Param,
	Patch,
	UploadedFile,
	UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ProfileService } from './profile.service';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { User, UserData } from '@decorators/user.decorator';
import { ProfileDto } from './profile.dto';
import { MAX_FILE_SIZE_MEGABYTES, VALID_IMAGE_MIME_TYPES } from '@shared/constants';
import { ERRORS } from '@shared/errors';

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
		return await this.service.getProfile(user.id);
	}

	/**
	 * @tag Profile
	 * @summary Чужой профиль
	 * @security token
	 */
	@Get(':userId')
	public async getSomeone(@User() user: UserData, @Param('userId') userId: string): Promise<ProfileDto.Entity> {
		return await this.service.getOtherProfile(user.id, userId);
	}

	/**
	 * @tag Profile
	 * @summary Редактирование профиля
	 * @security token
	 */
	@Patch()
	@UseInterceptors(
		FileInterceptor('avatarFilename', {
			fileFilter: (_req, file, callb) => {
				if (!VALID_IMAGE_MIME_TYPES.includes(file.mimetype)) {
					return callb(new BadRequestException(`_avatarFilename:${ERRORS.BAD_REQUEST}`), false);
				}

				callb(null, false);
			},
			limits: {
				fileSize: MAX_FILE_SIZE_MEGABYTES * 1024 * 1024,
			},
		}),
	)
	public async edit(
		@User() user: UserData,
		@Body() body: ProfileDto.Edit,
		@UploadedFile() avatarFilename?: Express.Multer.File,
	): Promise<ProfileDto.Entity> {
		return await this.service.edit(user.id, {
			...body,
			avatarFilename: typeof body.avatarFilename === 'string' ? body.avatarFilename : avatarFilename,
		});
	}
}
