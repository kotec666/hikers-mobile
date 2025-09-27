import { Controller, UseInterceptors } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementDto } from './achievements.dto';
import { TypedParam, TypedRoute } from '@nestia/core';
import { User } from 'src/common/decorators/user.decorator';
import { TokenDto } from '../token/token.dto';
import { UserInterceptor } from 'src/common/interceptors/user.interceptor';

@Controller('achievements')
@UseInterceptors(UserInterceptor)
export class AchievementsContoller {
	constructor(private readonly service: AchievementsService) {}

	/**
	 * @tag Achievements
	 * @summary Получить полученные достижения
	 * @security token
	 */
	@TypedRoute.Get('claimed')
	public async getClaimed(@User() user: TokenDto.Payload): Promise<AchievementDto.Entity[]> {
		return this.service.getClaimed(user.id);
	}

	/**
	 * @tag Achievements
	 * @summary Получить НЕполученные достижения
	 * @security token
	 */
	@TypedRoute.Get('unclaimed')
	public async getUnclaimed(@User() user: TokenDto.Payload): Promise<AchievementDto.Entity[]> {
		return this.service.getUnclaimed(user.id);
	}

	/**
	 * @tag Achievements
	 * @summary Получить все достижения (пока без пагинации)
	 * @security token
	 */
	@TypedRoute.Get()
	public async getAll(@User() user: TokenDto.Payload): Promise<AchievementDto.Entity[]> {
		return this.service.getAll(user.id);
	}

	/**
	 * @tag Achievements
	 * @summary Получить достижение по id
	 * @security token
	 */
	@TypedRoute.Get('/:id')
	public async getById(@TypedParam('id') id: string, @User() user: TokenDto.Payload): Promise<AchievementDto.Entity> {
		return await this.service.getById(id, user.id);
	}
}
