import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { userSubscribers } from '../database/schema';
import { SubscriberDto, SubscribtionDto } from './subscribers.dto';
import { and, eq } from 'drizzle-orm';
import { CommonDto } from 'src/common/dto/common.dto';
import { ERRORS } from '@shared/errors';
import { getSubscribersQuery, getSubscribtionsQuery } from './subscribers.queries';

@Injectable()
export class SubscribersService {
	constructor(private readonly db: DatabaseService) {}

	/** Получить подписки */
	public async getSubscribtions(userId: string): Promise<SubscribtionDto.Entity[]> {
		// @TODO пагинация
		return (await this.db.db.execute(getSubscribtionsQuery(userId))).rows as SubscribtionDto.Entity[];
	}

	/** Получить подписчиков */
	public async getSubscribers(userId: string): Promise<SubscriberDto.Entity[]> {
		// @TODO пагинация
		return (await this.db.db.execute(getSubscribersQuery(userId))).rows as SubscriberDto.Entity[];
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
