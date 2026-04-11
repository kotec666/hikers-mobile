import { Body, Controller, Delete, Get, Patch, Post, Query, UseInterceptors } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { User, UserData } from '@decorators/user.decorator';
import { NotNegative } from '@validation/query-decorators';
import { NotificationDto } from './notifications.dto';
import { CommonDto } from '../../common/dto/common.dto';

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
	public debugPost(
		@User() user: UserData,
		@NotNegative('time') @Query('time') time: number,
		@Body() dto: NotificationDto.RequestDebug,
	) {
		return this.service.debugCreateAndPush(user.id, time, dto);
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
		@Query('read') read?: boolean,
	): Promise<NotificationDto.Entity[]> {
		return this.service.getNotifications(user.id, page, limit, read);
	}

	/**
	 * @tag Notifications
	 * @security token
	 * @summary Удалить уведы. Если массив ids пустой - удалятся все
	 */
	@Delete('delete')
	public delete(
		@User() user: UserData,
		@Body() dto: NotificationDto.RequestRead,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.delete(user.id, dto.ids.length > 0 ? dto.ids : undefined);
	}

	/**
	 * @tag Notifications
	 * @security token
	 * @summary Пометить уведы как прочитанные
	 */
	@Patch('read')
	public read(@User() user: UserData, @Body() dto: NotificationDto.RequestRead): Promise<CommonDto.BooleanResponse> {
		return this.service.read(user.id, dto.ids);
	}

	/**
	 * @tag Notifications
	 * @security token
	 * @summary Есть ли непрочинанные уведы
	 */
	@Get('have-unread')
	public haveUnread(@User() user: UserData): Promise<CommonDto.ExistsResponse> {
		return this.service.haveUnread(user.id);
	}

	/**
	 * @tag Notifications
	 * @security token
	 * @summary Получить настройки уведов
	 */
	@Get('settings')
	public getSettings(@User() user: UserData): Promise<Required<NotificationDto.Settings>> {
		return this.service.getSettings(user.id);
	}

	/**
	 * @tag Notifications
	 * @security token
	 * @summary Настроить получаемые уведы
	 */
	@Patch('settings')
	public setSettings(
		@User() user: UserData,
		@Body() dto: NotificationDto.RequestSettings,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.setSettings(user.id, dto.settings);
	}
}
