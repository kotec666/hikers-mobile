import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { userSubscribers } from '../database/schema';
import { SubscriberDto, SubscriptionDto } from './subscribers.dto';
import { and, count, eq } from 'drizzle-orm';
import { CommonDto } from 'src/common/dto/common.dto';
import { ERRORS } from '@shared/errors';
import { getSubscribersQuery, getSubscriptionsQuery } from './subscribers.queries';

@Injectable()
export class SubscribersService {
	constructor(private readonly db: DatabaseService) {}

	/** Получить подписки */
	public async getSubscriptions(userId: string): Promise<SubscriptionDto.Entity[]> {
		// @TODO пагинация
		return (await this.db.db.execute(getSubscriptionsQuery(userId))).rows as SubscriptionDto.Entity[];
	}

	/** Получить подписчиков */
	public async getSubscribers(userId: string): Promise<SubscriberDto.Entity[]> {
		// @TODO пагинация
		return (await this.db.db.execute(getSubscribersQuery(userId))).rows as SubscriberDto.Entity[];
	}

	/** Получить кол-во подписчиков */
	public async getSubscribersCount(userId: string): Promise<number> {
		const [subscribers] = await this.db.db
			.select({ count: count() })
			.from(userSubscribers)
			.where(eq(userSubscribers.userId, userId));

		return subscribers.count;
	}

	/** Получить кол-во подписок */
	public async getSubscriptionsCount(userId: string): Promise<number> {
		const [subscriptions] = await this.db.db
			.select({ count: count() })
			.from(userSubscribers)
			.where(eq(userSubscribers.userSubscriberId, userId));

		return subscriptions.count;
	}

	public async subscribe(subscriberUserId: string, toUserId: string): Promise<CommonDto.BooleanResponse> {
		if (subscriberUserId === toUserId) {
			throw new BadRequestException(ERRORS.BAD_REQUEST);
		}

		const [existingSubscription] = await this.db.db
			.select()
			.from(userSubscribers)
			.where(and(eq(userSubscribers.userId, toUserId), eq(userSubscribers.userSubscriberId, subscriberUserId)));
		if (existingSubscription) {
			throw new BadRequestException(ERRORS.ALREADY_CREATED);
		}

		await this.db.db.insert(userSubscribers).values({
			userId: toUserId,
			userSubscriberId: subscriberUserId,
		});

		return { success: true };
	}

	public async unsubscribe(subscriberUserId: string, toUserId: string): Promise<CommonDto.BooleanResponse> {
		await this.db.db
			.delete(userSubscribers)
			.where(and(eq(userSubscribers.userId, toUserId), eq(userSubscribers.userSubscriberId, subscriberUserId)));

		return { success: true };
	}
}
