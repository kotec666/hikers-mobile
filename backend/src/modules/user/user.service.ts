import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UserDto } from './user.dto';
import {
	notifications,
	notificationsSettings,
	postLikes,
	posts,
	tokens,
	training,
	trainingInvites,
	trainingMetrics,
	trainingParticipants,
	trainingRoutes,
	userAchievements,
	userActivities,
	userFriends,
	userFriendsInvites,
	users,
	userSubscribers,
} from '../database/schema';
import { and, eq, ilike, InferInsertModel, ne, or, sql } from 'drizzle-orm';
import { comparePassword, hashPassword } from './user.helpers';
import { ERRORS } from '@shared/errors';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Event } from '@events/constants';
import { CommonDto } from '../../common/dto/common.dto';

@Injectable()
export class UserService {
	constructor(
		private readonly db: DatabaseService,
		private readonly eventEmitter: EventEmitter2,
	) {}

	public async createUser(dto: UserDto.Registration): Promise<UserDto.Entity> {
		const hashedPassword = await hashPassword(dto.password);

		const [user] = await this.db.db
			.insert(users)
			.values({
				email: dto.email,
				username: dto.username,
				password: hashedPassword,
				termsAcceptedAt: dto.isTermsAccepted ? new Date() : null,
				emailConfirmedAt: new Date(),
			})
			.returning({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				avatarFilename: users.avatarFilename,
			});
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		this.eventEmitter.emit(Event.USER_CREATED, user.id);

		return user;
	}

	public async updateUser(id: string, dto: Partial<InferInsertModel<typeof users>>): Promise<UserDto.Entity> {
		if (dto['id']) delete dto['id'];
		if (dto['password']) delete dto['password'];

		const [user] = await this.db.db.update(users).set(dto).where(eq(users.id, id)).returning({
			id: users.id,
			name: users.name,
			username: users.username,
			color: users.color,
			avatarFilename: users.avatarFilename,
		});
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return user;
	}

	public async getUserByEmailAndPassword(dto: UserDto.Login): Promise<UserDto.Entity> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				avatarFilename: users.avatarFilename,
				password: users.password,
			})
			.from(users)
			.where(eq(users.email, dto.email))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const isPasswordCorrect = await comparePassword(dto.password, user.password);
		if (!isPasswordCorrect) {
			throw new BadRequestException(ERRORS.MISMATCH);
		}

		return {
			id: user.id,
			name: user.name,
			username: user.username,
			color: user.color,
			avatarFilename: user.avatarFilename,
		};
	}

	public async getUserByUsername(username: string): Promise<UserDto.Entity> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				email: users.email,
				avatarFilename: users.avatarFilename,
			})
			.from(users)
			.where(eq(users.username, username))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return user;
	}

	public async getUserByEmail(email: string): Promise<UserDto.Entity> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				avatarFilename: users.avatarFilename,
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return user;
	}

	public async changePassword(email: string, newPassword: string, shouldBeDifferent = true): Promise<UserDto.Entity> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				avatarFilename: users.avatarFilename,
				password: users.password,
			})
			.from(users)
			.where(eq(users.email, email))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const isPasswordSame = await comparePassword(newPassword, user.password);
		if (shouldBeDifferent && isPasswordSame) {
			throw new BadRequestException(ERRORS.SHOULD_BE_DIFFERENT);
		}

		const hashedPassword = await hashPassword(newPassword);

		const [updatedUser] = await this.db.db
			.update(users)
			.set({
				password: hashedPassword,
			})
			.where(eq(users.id, user.id))
			.returning({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				avatarFilename: users.avatarFilename,
			});

		return updatedUser;
	}

	public async deleteUser(userId: string): Promise<CommonDto.BooleanResponse> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				avatarFilename: users.avatarFilename,
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		// Токен можно и без транзы удалить, ничего страшного если релогин потребуется
		await this.db.db.delete(tokens).where(eq(tokens.userId, userId));

		await Promise.all([
			// Удаляем часть, которая отвечает за профиль юзера
			this.db.db.transaction(async (tx) => {
				await tx
					.delete(userSubscribers)
					.where(or(eq(userSubscribers.userId, userId), eq(userSubscribers.userSubscriberId, userId)));

				await tx
					.delete(userFriendsInvites)
					.where(or(eq(userFriendsInvites.userId, userId), eq(userFriendsInvites.invitedUserId, userId)));
				await tx
					.delete(userFriends)
					.where(or(eq(userFriends.userId, userId), eq(userFriends.userFriendId, userId)));

				await tx.delete(userActivities).where(eq(userActivities.userId, userId));
				await tx.delete(userAchievements).where(eq(userAchievements.userId, userId));
			}),

			// Удаляем часть, которая отвечает за тренировки
			this.db.db.transaction(async (tx) => {
				const participantIds = await tx
					.select({ id: trainingParticipants.id })
					.from(trainingParticipants)
					.where(eq(trainingParticipants.userId, userId));

				await Promise.all(
					participantIds.map(async (p) => {
						await tx.delete(trainingMetrics).where(eq(trainingMetrics.participantId, p.id));
						await tx.delete(trainingRoutes).where(eq(trainingRoutes.participantId, p.id));
					}),
				);

				await tx.delete(trainingParticipants).where(eq(trainingParticipants.userId, userId));

				await tx
					.delete(trainingInvites)
					.where(or(eq(trainingInvites.userId, userId), eq(trainingInvites.invitedUserId, userId)));

				await tx
					.update(training)
					.set({
						userCreatorId: null,
					})
					.where(eq(training.userCreatorId, userId));
			}),

			// Удаляем часть, которая отвечает за посты
			this.db.db.transaction(async (tx) => {
				await tx.delete(postLikes).where(eq(postLikes.userId, userId));

				await tx
					.update(posts)
					.set({
						userCreatorId: null,
					})
					.where(eq(posts.userCreatorId, userId));
			}),

			// Удаляем часть, которая отвечает за уведы
			this.db.db.transaction(async (tx) => {
				await tx.delete(notifications).where(eq(notifications.toUserId, userId));
				await tx.delete(notificationsSettings).where(eq(notificationsSettings.userId, userId));
			}),
		]);

		// Ну и если промис выше завершился без ошибок, то чикаем юзера
		await this.db.db.delete(users).where(eq(users.id, userId));

		return { success: true };
	}

	public async getUserWithEmail(id: string): Promise<UserDto.EntityWithEmail> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				avatarFilename: users.avatarFilename,
				email: users.email,
				isEmailConfirmed: sql<boolean>`${users.emailConfirmedAt} IS NOT NULL`,
			})
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return user;
	}

	public async getUser(id: string): Promise<UserDto.Entity> {
		const [user] = await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				avatarFilename: users.avatarFilename,
			})
			.from(users)
			.where(eq(users.id, id))
			.limit(1);
		if (!user) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return user;
	}

	public async checkEmailAvailable(email: string): Promise<void> {
		const [existingUser] = await this.db.db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.email, email))
			.limit(1);

		if (existingUser) {
			throw new BadRequestException(ERRORS.ALREADY_EXISTS);
		}
	}

	public async getAll(): Promise<UserDto.Entity[]> {
		return await this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				avatarFilename: users.avatarFilename,
			})
			.from(users);
	}

	public async search(userId: string, page: number, limit: number, searchWord?: string): Promise<UserDto.Entity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const query = this.db.db
			.select({
				id: users.id,
				name: users.name,
				username: users.username,
				color: users.color,
				avatarFilename: users.avatarFilename,
			})
			.from(users)
			.offset(offset)
			.limit(limit);

		if (searchWord) {
			query.where(
				and(
					ne(users.id, userId),
					or(ilike(users.username, `%${searchWord}%`), ilike(users.name, `%${searchWord}%`)),
				),
			);
		} else {
			query.where(ne(users.id, userId));
		}

		return await query;
	}
}
