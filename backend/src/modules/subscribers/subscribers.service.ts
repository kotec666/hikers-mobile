import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { users, userSubscribers } from '../database/schema';
import { SubscriberDto, SubscriptionDto } from './subscribers.dto';
import { and, count, eq } from 'drizzle-orm';
import { CommonDto } from '../../common/dto/common.dto';
import { ERRORS } from '@shared/errors';

@Injectable()
export class SubscribersService {
	constructor(private readonly db: DatabaseService) {}

	/** Получить подписки */
	public async getSubscriptions(userId: string, page: number, limit: number): Promise<SubscriptionDto.Entity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		return await this.db.db
			.select({
				user: {
					id: users.id,
					name: users.name,
					username: users.username,
					avatarFilename: users.avatarFilename,
				},
			})
			.from(userSubscribers)
			.where(eq(userSubscribers.userSubscriberId, userId))
			.innerJoin(users, eq(users.id, userSubscribers.userId))
			.offset(offset)
			.limit(limit);
	}

	/** Получить подписчиков */
	public async getSubscribers(userId: string, page: number, limit: number): Promise<SubscriberDto.Entity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		return await this.db.db
			.select({
				user: {
					id: users.id,
					name: users.name,
					username: users.username,
					avatarFilename: users.avatarFilename,
				},
			})
			.from(userSubscribers)
			.where(eq(userSubscribers.userId, userId))
			.innerJoin(users, eq(users.id, userSubscribers.userSubscriberId))
			.offset(offset)
			.limit(limit);
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

	public async isSubscribed(userSubscriberId: string, otherUserId: string): Promise<boolean> {
		const [subscribed] = await this.db.db
			.select({ userId: userSubscribers.userId })
			.from(userSubscribers)
			.where(and(eq(userSubscribers.userId, otherUserId), eq(userSubscribers.userSubscriberId, userSubscriberId)))
			.limit(1);

		return !!subscribed;
	}

	public async subscribe(subscriberUserId: string, toUserId: string): Promise<CommonDto.BooleanResponse> {
		if (subscriberUserId === toUserId) {
			throw new BadRequestException(ERRORS.MISMATCH);
		}

		const [existingSubscription] = await this.db.db
			.select()
			.from(userSubscribers)
			.where(and(eq(userSubscribers.userId, toUserId), eq(userSubscribers.userSubscriberId, subscriberUserId)));
		if (existingSubscription) {
			throw new BadRequestException(ERRORS.ALREADY_EXISTS);
		}

		await this.db.db.insert(userSubscribers).values({
			userId: toUserId,
			userSubscriberId: subscriberUserId,
		});

		return { success: true };
	}

	public async unsubscribe(subscriberUserId: string, toUserId: string): Promise<CommonDto.BooleanResponse> {
		const [existingSubscription] = await this.db.db
			.delete(userSubscribers)
			.where(and(eq(userSubscribers.userId, toUserId), eq(userSubscribers.userSubscriberId, subscriberUserId)))
			.returning({ userId: userSubscribers.userId });
		if (!existingSubscription) {
			throw new BadRequestException(ERRORS.NOT_FOUND);
		}

		return { success: true };
	}
}
