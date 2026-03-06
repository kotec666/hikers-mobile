import { Injectable } from '@nestjs/common';
import { NotificationDto } from './notifications.dto';
import { DatabaseService } from '../database/database.service';
import { notifications } from '../database/schema';
import { and, eq, isNotNull, isNull } from 'drizzle-orm';

@Injectable()
export class NotificationsService {
	constructor(private readonly db: DatabaseService) {}

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
}
