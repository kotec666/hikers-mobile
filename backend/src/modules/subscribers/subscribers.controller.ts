import { Controller, Delete, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { SubscribersService } from './subscribers.service';
import { UserInterceptor } from 'src/common/interceptors/user.interceptor';
import { SubscriberDto, SubscriptionDto } from './subscribers.dto';
import { CommonDto } from 'src/common/dto/common.dto';
import { User, UserData } from 'src/common/decorators/user.decorator';
import { IsUUID } from '@validation/uuid.validatior';

@Controller('subscribers')
@UseInterceptors(UserInterceptor)
export class SubscribersController {
	constructor(private readonly service: SubscribersService) {}

	/**
	 * @tag Subscribers
	 * @summary Подписаться на юзера по его id
	 * @security token
	 */
	@Post(':userId')
	public async subscribe(
		@User() user: UserData,
		@IsUUID('userId') @Param('userId') toUserId: string,
	): Promise<CommonDto.BooleanResponse> {
		return await this.service.subscribe(user.id, toUserId);
	}

	/**
	 * @tag Subscribers
	 * @summary Отписаться от юзера по его id
	 * @security token
	 */
	@Delete(':userId')
	public async unsubscribe(
		@User() user: UserData,
		@IsUUID('userId') @Param('userId') userId: string,
	): Promise<CommonDto.BooleanResponse> {
		return await this.service.unsubscribe(user.id, userId);
	}

	/**
	 * @tag Subscribers
	 * @summary Получить подписки (на кого сам подписан)
	 * @security token
	 */
	@Get('me')
	public async getSubscriptions(@User() user: UserData): Promise<SubscriptionDto.Entity[]> {
		return await this.service.getSubscriptions(user.id);
	}

	/**
	 * @tag Subscribers
	 * @summary Получить подписчиков
	 * @security token
	 */
	@Get('my')
	public async getSubscribers(@User() user: UserData): Promise<SubscriberDto.Entity[]> {
		return await this.service.getSubscribers(user.id);
	}
}
