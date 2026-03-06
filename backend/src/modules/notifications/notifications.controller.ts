import { Body, Controller, Get, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { User, UserData } from '@decorators/user.decorator';
import { NotNegative } from '@validation/query-decorators';
import { NotificationDto } from './notifications.dto';
import { CommonDto } from 'src/common/dto/common.dto';

@UseInterceptors(UserInterceptor)
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly service: NotificationsService) {}

	/**
	 * @tag Notifications
	 * @security token
	 * @summary DEBUG. Создать и отправить пуш по ws через time мс
	 */
	@Post()
	public debugPost(@User() user: UserData, @NotNegative('time') @Query('time') time: number) {
		return this.service.debugCreateAndPush(user.id, time);
	}

	/**
	 * @tag Notifications
	 * @security token
	 * @summary Получить уведы с пагинацией
	 */
	@Get()
	public get(
		@User() user: UserData,
		@NotNegative('page') @Query('page') page: number,
		@NotNegative('limit') @Query('limit') limit: number,
		@Query('readed') readed?: boolean,
	): Promise<NotificationDto.Entity[]> {
		return this.service.getNotifications(user.id, page, limit, readed);
	}

	/**
	 * @tag Notifications
	 * @security token
	 * @summary Пометить уведы как прочитанные
	 */
	@Patch('read')
	public read(@User() user: UserData, @Body() dto: NotificationDto.Read): Promise<CommonDto.BooleanResponse> {
		return this.service.read(user.id, dto.ids);
	}
}
