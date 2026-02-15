import { Controller, Get, Param, UseInterceptors } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { AchievementDto } from './achievements.dto';
import { User } from '../../common/decorators/user.decorator';
import { TokenDto } from '../token/token.dto';
import { UserInterceptor } from '@interceptors/user.interceptor';

@Controller('achievements')
@UseInterceptors(UserInterceptor)
export class AchievementsContoller {
	constructor(private readonly service: AchievementsService) {}

	/**
	 * @tag Achievements
	 * @summary Получить полученные достижения пользователя по его id
	 * @security token
	 */
	@Get('claimed/:userId')
	public async getClaimedByUserId(@Param('userId') userId: string): Promise<AchievementDto.Entity[]> {
		return this.service.getClaimed(userId);
	}

	/**
	 * @tag Achievements
	 * @summary Получить полученные достижения
	 * @security token
	 */
	@Get('claimed')
	public async getClaimed(@User() user: TokenDto.Payload): Promise<AchievementDto.Entity[]> {
		return this.service.getClaimed(user.id);
	}

	/**
	 * @tag Achievements
	 * @summary Получить НЕполученные достижения
	 * @security token
	 */
	@Get('unclaimed')
	public async getUnclaimed(@User() user: TokenDto.Payload): Promise<AchievementDto.Entity[]> {
		return this.service.getUnclaimed(user.id);
	}

	/**
	 * @tag Achievements
	 * @summary Получить все достижения (пока без пагинации)
	 * @security token
	 */
	@Get()
	public async getAll(@User() user: TokenDto.Payload): Promise<AchievementDto.Entity[]> {
		return this.service.getAll(user.id);
	}

	/**
	 * @tag Achievements
	 * @summary Получить достижение по id
	 * @security token
	 */
	@Get('/:id')
	public async getById(@Param('id') id: string, @User() user: TokenDto.Payload): Promise<AchievementDto.Entity> {
		return await this.service.getById(id, user.id);
	}
}
