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
import { IsUUID } from '@validation/parameter-decorators';
import { CommonDto } from '../../common/dto/common.dto';

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
	public async getMe(@User() user: UserData): Promise<ProfileDto.MyEntity> {
		return this.service.getProfile(user.id);
	}

	/**
	 * @tag Profile
	 * @summary Чужой профиль
	 * @security token
	 */
	@Get(':userId')
	public async getSomeoneById(
		@User() user: UserData,
		@IsUUID('userId') @Param('userId') userId: string,
	): Promise<ProfileDto.Entity> {
		return this.service.getOtherProfileById(user.id, userId);
	}

	/**
	 * @tag Profile
	 * @summary Чужой профиль по username
	 * @security token
	 */
	@Get('/by-username/:username')
	public async getSomeoneByUsername(
		@User() user: UserData,
		@Param('username') username: string,
	): Promise<ProfileDto.Entity> {
		return this.service.getOtherProfileByUsername(user.id, username);
	}

	/**
	 * @tag Profile
	 * @summary Выбор эмодзи в профиле
	 * @security token
	 */
	@Patch('/set-badge')
	public async setBadge(
		@User() user: UserData,
		@Body() body: ProfileDto.SetBadge,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.setBadge(user.id, body.badge);
	}

	/**
	 * @tag Profile
	 * @summary Выбор своего цвета
	 * @security token
	 */
	@Patch('/set-color')
	public async setColor(
		@User() user: UserData,
		@Body() body: ProfileDto.SetColor,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.setColor(user.id, body.colorRgb);
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

				callb(null, true);
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
		return this.service.edit(user.id, {
			...body,
			avatarFilename: typeof body.avatarFilename === 'string' ? body.avatarFilename : avatarFilename,
		});
	}
}
