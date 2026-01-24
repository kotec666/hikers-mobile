import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiyDto } from './activities.dto';
import { User, UserData } from '../../common/decorators/user.decorator';
import { UserInterceptor } from '../../common/interceptors/user.interceptor';

@Controller('activities')
@UseInterceptors(UserInterceptor)
export class ActivitiesController {
	constructor(private readonly service: ActivitiesService) {}

	/**
	 * @tag Activities
	 * @summary Получить топ N активностей юзера (ближе к началу списка = выше в топе)
	 * @security token
	 */
	@Get()
	public async getTop(@User() user: UserData, @Query('limit') limit: number): Promise<ActivitiyDto.Entity[]> {
		return this.service.getAll(user.id, Number(limit));
	}
}
