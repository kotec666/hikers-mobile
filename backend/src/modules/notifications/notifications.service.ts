import { Injectable } from '@nestjs/common';
import { NotificationDto } from './notifications.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class NotificationsService {
	constructor(private readonly db: DatabaseService) {}

	public async getNotifications(
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		userId: string,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		page: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		limit: number,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		onlyNotReaded?: boolean,
	): Promise<NotificationDto.Entity[]> {
		return [];
	}
}
