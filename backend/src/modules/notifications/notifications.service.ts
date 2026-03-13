import { BadRequestException, Injectable } from '@nestjs/common';
import { NotificationDto } from './notifications.dto';
import { DatabaseService } from '../database/database.service';
import { achievements, notifications, posts, trainingInvites, userFriendsInvites, users } from '../database/schema';
import { and, eq, inArray, isNotNull, isNull, sql } from 'drizzle-orm';
import { CommonDto } from 'src/common/dto/common.dto';
import { WebsocketsGateway } from '../websockets/websockets.gateway';
import { NotificationType } from '@shared/enums';
import { ERRORS } from '@shared/errors';
import { desc } from '../database/extensions';

@Injectable()
export class NotificationsService {
	constructor(private readonly db: DatabaseService) {}

	public push(userId: string, notif: NotificationDto.Entity): boolean {
		return WebsocketsGateway.emitToUser(userId, 'notification', notif);
	}

	// @TODO убрать после тестов
	public async debugCreateAndPush(
		userId: string,
		timeMs: number,
		dto: NotificationDto.RequestDebug,
	): Promise<NotificationDto.Entity> {
		const notif = await this.create(userId, dto);

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
			.orderBy(desc(notifications.createdAt))
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

	public async create(userId: string, dto: NotificationDto.Create): Promise<NotificationDto.Entity> {
		if (!dto.relEntityId && !dto.text) {
			throw new BadRequestException(ERRORS.BAD_REQUEST);
		}

		const [existingNotif] = await this.db.db
			.select({ action: notifications.action })
			.from(notifications)
			.where(
				and(
					eq(notifications.toUserId, userId),
					eq(notifications.type, dto.type),
					// Нас интересуют только НЕпрочитанные уведы, возможность дублирования прочинанных уведов оставляем
					isNull(notifications.readedAt),
					sql`action->>'relEntityId' = ${dto.relEntityId}`,
				),
			)
			.limit(1);
		if (existingNotif) {
			throw new BadRequestException(ERRORS.ALREADY_EXISTS);
		}

		let notifText = dto.text ?? '';
		let iconFilename = dto.iconFilename ?? null;
		if (dto.relEntityId) {
			const relEntity = await this.getRelatedEntity(dto.type, dto.relEntityId);
			if (!relEntity) {
				throw new BadRequestException(ERRORS.BAD_REQUEST);
			}

			iconFilename = relEntity.iconFilename;
			notifText = this.getTextByTypeAndEntity(dto.type, relEntity.title);
		}

		const [notif] = await this.db.db
			.insert(notifications)
			.values({
				toUserId: userId,
				type: dto.type,
				action: {
					iconFilename: iconFilename,
					text: notifText,
					relEntityId: dto.relEntityId ?? null,
				},
			})
			.returning({
				id: notifications.id,
				type: notifications.type,
				createdAt: notifications.createdAt,
				readedAt: notifications.readedAt,
				action: notifications.action,
			})
			.onConflictDoNothing();

		return notif;
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

	// @TODO проблема - текст уведа будет всегда на одном и том же языке (русский)
	private getTextByTypeAndEntity(type: NotificationType, relEntityName?: string): string {
		switch (type) {
			case NotificationType.ACHIEVEMENT:
				return `Получено достижение${relEntityName ? ': ' + relEntityName : ''}`;
			case NotificationType.FRIEND_INVITE:
				return `Пользователь ${relEntityName ? relEntityName + ' ' : ''}отправил запрос в друзья`;
			case NotificationType.TRAINING_INVITE:
				return `Пользователь ${relEntityName ? relEntityName + ' ' : ''}пригласил вас на тренировку`;
			case NotificationType.TAGGED_IN_POST:
				return `Пользователь ${relEntityName ? relEntityName + ' ' : ''}отметил вас в публикации`;
			default:
				throw new Error(ERRORS.BAD_REQUEST);
		}
	}

	private async getRelatedEntity(
		type: NotificationType,
		relEntityId: string,
	): Promise<{
		iconFilename: string | null;
		title: string;
	} | null> {
		switch (type) {
			case NotificationType.ACHIEVEMENT: {
				const [achieve] = await this.db.db
					.select({
						iconFilename: achievements.iconFilename,
						title: achievements.title,
					})
					.from(achievements)
					.where(eq(achievements.id, relEntityId))
					.limit(1);
				if (!achieve) {
					return null;
				}

				return achieve;
			}
			case NotificationType.FRIEND_INVITE: {
				const [invite] = await this.db.db
					.select({
						iconFilename: users.avatarFilename,
						title: sql<string>`COALESCE('@' || ${users.username}, '')`.as('title'),
					})
					.from(userFriendsInvites)
					.where(eq(userFriendsInvites.userId, relEntityId))
					.innerJoin(users, eq(users.id, relEntityId))
					.limit(1);
				if (!invite) {
					return null;
				}

				return invite;
			}
			case NotificationType.TRAINING_INVITE: {
				const [invite] = await this.db.db
					.select({
						iconFilename: users.avatarFilename,
						title: sql<string>`COALESCE('@' || ${users.username}, '')`.as('title'),
					})
					.from(trainingInvites)
					.where(eq(trainingInvites.userId, relEntityId))
					.innerJoin(users, eq(users.id, relEntityId))
					.limit(1);
				if (!invite) {
					return null;
				}

				return invite;
			}
			case NotificationType.TAGGED_IN_POST: {
				const [post] = await this.db.db
					.select({
						iconFilename: users.avatarFilename,
						title: sql<string>`COALESCE('@' || ${users.username}, '')`.as('title'),
					})
					.from(posts)
					.where(eq(posts.id, relEntityId))
					.innerJoin(users, eq(users.id, posts.userCreatorId))
					.limit(1);
				if (!post) {
					return null;
				}

				return post;
			}
			default:
				throw new Error(ERRORS.BAD_REQUEST);
		}
	}
}
