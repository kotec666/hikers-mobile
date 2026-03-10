import { Injectable } from '@nestjs/common';
import { NotificationDto } from './notifications.dto';
import { DatabaseService } from '../database/database.service';
import { notifications } from '../database/schema';
import { and, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import { CommonDto } from 'src/common/dto/common.dto';
import { WebsocketsGateway } from '../websockets/websockets.gateway';

@Injectable()
export class NotificationsService {
	constructor(private readonly db: DatabaseService) {}

	public push(userId: string, notif: NotificationDto.Entity): boolean {
		return WebsocketsGateway.emitToUser(userId, 'notification', notif);
	}

	public async debugCreateAndPush(
		userId: string,
		timeMs: number,
		dto: NotificationDto.RequestDebug,
	): Promise<NotificationDto.Entity> {
		const [notif] = await this.db.db
			.insert(notifications)
			.values({
				toUserId: userId,
				type: dto.type,
				action: {
					iconFilename: dto.iconFilename,
					text: dto.text,
					relEntityId: dto.relEntityId ?? null,
				},
			})
			.returning({
				id: notifications.id,
				type: notifications.type,
				createdAt: notifications.createdAt,
				readedAt: notifications.readedAt,
				action: notifications.action,
			});

		setTimeout(() => {
			this.push(userId, notif);
		}, timeMs);
		return notif;
	}

	public async getNotifications(
		userId: string,
		page: number,
		limit: number,
		readed?: boolean,
	): Promise<NotificationDto.Entity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const query = this.db.db
			.select({
				id: notifications.id,
				type: notifications.type,
				createdAt: notifications.createdAt,
				readedAt: notifications.readedAt,
				action: notifications.action,
			})
			.from(notifications)
			.offset(offset)
			.limit(limit);

		if (typeof readed !== 'undefined') {
			query.where(
				and(
					readed ? isNotNull(notifications.readedAt) : isNull(notifications.readedAt),
					eq(notifications.toUserId, userId),
				),
			);
		} else {
			query.where(eq(notifications.toUserId, userId));
		}

		return await query;
	}

	public async haveUnread(userId: string): Promise<CommonDto.ExistsResponse> {
		const [query] = await this.db.db
			.select({ id: notifications.id })
			.from(notifications)
			.where(and(eq(notifications.toUserId, userId), isNull(notifications.readedAt)))
			.limit(1);

		return { exists: !!query };
	}

	public async read(userId: string, ids: string[]): Promise<CommonDto.BooleanResponse> {
		await this.db.db
			.update(notifications)
			.set({
				readedAt: sql`NOW()`,
			})
			.where(
				and(eq(notifications.toUserId, userId), inArray(notifications.id, ids), isNull(notifications.readedAt)),
			);

		return { success: true };
	}

	public async delete(userId: string, ids?: string[]): Promise<CommonDto.BooleanResponse> {
		const query = this.db.db.delete(notifications);

		if (ids) {
			query.where(and(eq(notifications.toUserId, userId), inArray(notifications.id, ids)));
		} else {
			query.where(eq(notifications.toUserId, userId));
		}

		await query;

		return { success: true };
	}
}
