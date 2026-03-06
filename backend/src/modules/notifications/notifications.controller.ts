import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { UserInterceptor } from '@interceptors/user.interceptor';
import { User, UserData } from '@decorators/user.decorator';
import { NotNegative } from '@validation/query-decorators';

@UseInterceptors(UserInterceptor)
@Controller('notifications')
export class NotificationsController {
	constructor(private readonly service: NotificationsService) {}

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
	) {
		return this.service.getNotifications(user.id, page, limit, readed);
	}
}
