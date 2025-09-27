import { Controller, UseInterceptors } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementDto } from './achievements.dto';
import { TypedParam, TypedRoute } from '@nestia/core';
import { User } from 'src/common/decorators/user.decorator';
import { TokenDto } from '../token/token.dto';
import { UserInterceptor } from 'src/common/interceptors/user.interceptor';

@UseInterceptors(UserInterceptor)
@Controller('achievements')
export class AchievementsContoller {
	constructor(private readonly service: AchievementsService) {}

	/**
	 * @tag Achievements
	 * @summary Получить все достижения (пока без пагинации)
	 */
	@TypedRoute.Get()
	public async getAll(): Promise<AchievementDto.Entity[]> {
		return this.service.getAll();
	}

	/**
	 * @tag Achievements
	 * @summary Получить достижение по id
	 */
	@TypedRoute.Get('/:id')
	public async getById(@TypedParam('id') id: string): Promise<AchievementDto.Entity> {
		return await this.service.getById(id);
	}

	/**
	 * @tag Achievements
	 * @summary Получить полученные достижения
	 */
	@TypedRoute.Get('claimed')
	public async getClaimed(@User() user: TokenDto.Payload): Promise<AchievementDto.Entity[]> {
		return this.service.getClaimed(user.id);
	}

	/**
	 * @tag Achievements
	 * @summary Получить НЕполученные достижения
	 */
	@TypedRoute.Get('unclaimed')
	public async getUnclaimed(@User() user: TokenDto.Payload): Promise<AchievementDto.Entity[]> {
		return this.service.getUnclaimed(user.id);
	}
}
