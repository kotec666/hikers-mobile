import { NotificationDto } from './notifications.dto';
import { DatabaseService } from '../database/database.service';
import { notificationsSettings } from '../database/schema';
import { eq } from 'drizzle-orm';
import { CommonDto } from '../../common/dto/common.dto';
import { NotificationType } from '@shared/enums';
import { Inject } from '@nestjs/common';

export class NotificationsSettingsService {
	// @TODO если вдруг в будущем у нас будет 100 тыщ юзеров и несколько серваков, то этот способ не сработает
	private cachedUsersNotificationsSettings = new Map<string, Required<NotificationDto.Settings>>();

	constructor(
		@Inject(DatabaseService)
		private readonly db: DatabaseService,
	) {}

	public async isTypeAllowedBySettings(userId: string, type: NotificationType): Promise<boolean> {
		const settings = await this.getSettings(userId);
		return settings[type];
	}

	public getCachedSettings(userId: string): Required<NotificationDto.Settings> | null {
		return this.cachedUsersNotificationsSettings.get(userId) ?? null;
	}

	private setCachedSettings(userId: string, settings: Required<NotificationDto.Settings>): void {
		this.cachedUsersNotificationsSettings.set(userId, settings);
	}

	public async getSettings(userId: string): Promise<Required<NotificationDto.Settings>> {
		const cachedSettings = this.getCachedSettings(userId);
		if (cachedSettings) {
			return cachedSettings;
		}

		let filledSettings = {};
		const [settings] = await this.db.db
			.select()
			.from(notificationsSettings)
			.where(eq(notificationsSettings.userId, userId))
			.limit(1);
		if (!settings) {
			filledSettings = this.fillEmptySettings({});
		} else {
			filledSettings = this.fillEmptySettings(settings.settings);
		}

		// Кешируем при получении
		this.setCachedSettings(userId, filledSettings as Required<NotificationDto.Settings>);

		return filledSettings as Required<NotificationDto.Settings>;
	}

	public async setSettings(userId: string, settings: NotificationDto.Settings): Promise<CommonDto.BooleanResponse> {
		await this.db.db
			.insert(notificationsSettings)
			.values({
				userId,
				settings,
			})
			.onConflictDoUpdate({
				target: notificationsSettings.userId,
				set: { settings },
			});

		// Кешируем при обновлении
		this.setCachedSettings(userId, this.fillEmptySettings(settings));

		return { success: true };
	}

	private fillEmptySettings(s: NotificationDto.Settings): Required<NotificationDto.Settings> {
		const rs = {};
		for (const nType of Object.values(NotificationType)) {
			if (nType in s) {
				rs[nType] = s[nType];
			} else {
				// По-умолчанию юзер получает все уведы
				rs[nType] = true;
			}
		}

		return rs as Required<NotificationDto.Settings>;
	}
}
