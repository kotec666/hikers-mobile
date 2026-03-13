import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FriendDto } from './friends.dto';
import { userFriends, userFriendsInvites } from '../database/schema';
import { eq, and, or, count } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';
import { UserService } from '../user/user.service';
import { CommonDto } from '../../common/dto/common.dto';
import { FriendStatus, NotificationType } from '@shared/enums';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FriendsService {
	constructor(
		private readonly db: DatabaseService,
		private readonly users: UserService,
		private readonly notifications: NotificationsService,
	) {}

	public async getFriend(userId: string, userFriendId: string): Promise<FriendDto.Entity> {
		const [friendRow] = await this.db.db
			.select({
				userId: userFriends.userId,
				userFriendId: userFriends.userFriendId,
				createdAt: userFriends.createdAt,
			})
			.from(userFriends)
			.where(
				or(
					and(eq(userFriends.userId, userId), eq(userFriends.userFriendId, userFriendId)),
					and(eq(userFriends.userFriendId, userId), eq(userFriends.userId, userFriendId)),
				),
			)
			.limit(1);
		if (!friendRow) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const friendUserId = friendRow.userId === userId ? friendRow.userFriendId : friendRow.userId;
		const friendUser = await this.users.getUser(friendUserId);

		const friend: FriendDto.Entity = {
			user: {
				id: friendUser.id,
				name: friendUser.name,
				username: friendUser.username,
				avatarFilename: friendUser.avatarFilename,
				email: friendUser.email,
			},
		};
		return friend;
	}

	public async getFriends(userId: string, page: number, limit: number): Promise<FriendDto.Entity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const friends = await this.db.db
			.select({
				userId: userFriends.userId,
				userFriendId: userFriends.userFriendId,
				createdAt: userFriends.createdAt,
			})
			.from(userFriends)
			.where(or(eq(userFriends.userId, userId), eq(userFriends.userFriendId, userId)))
			.offset(offset)
			.limit(limit);

		return await Promise.all(
			friends.map(async (friendRow) => {
				const friendUserId = friendRow.userId === userId ? friendRow.userFriendId : friendRow.userId;
				const friendUser = await this.users.getUser(friendUserId);

				const friend: FriendDto.Entity = {
					user: {
						id: friendUser.id,
						name: friendUser.name,
						username: friendUser.username,
						avatarFilename: friendUser.avatarFilename,
						email: friendUser.email,
					},
				};
				return friend;
			}),
		);
	}

	public async getFriendsCount(userId: string): Promise<number> {
		const [friends] = await this.db.db
			.select({
				count: count(),
			})
			.from(userFriends)
			.where(or(eq(userFriends.userId, userId), eq(userFriends.userFriendId, userId)));

		return friends.count;
	}

	public async getFriendsStatus(user1Id: string, user2Id: string): Promise<FriendStatus> {
		const [existingFriend] = await this.db.db
			.select({
				userId: userFriends.userId,
			})
			.from(userFriends)
			.where(
				or(
					and(eq(userFriends.userId, user1Id), eq(userFriends.userFriendId, user2Id)),
					and(eq(userFriends.userId, user2Id), eq(userFriends.userFriendId, user1Id)),
				),
			);
		if (existingFriend) return FriendStatus.TRUE;

		const [invited] = await this.db.db
			.select({
				userId: userFriendsInvites.userId,
			})
			.from(userFriendsInvites)
			.where(
				or(
					and(eq(userFriendsInvites.userId, user1Id), eq(userFriendsInvites.invitedUserId, user2Id)),
					and(eq(userFriendsInvites.userId, user2Id), eq(userFriendsInvites.invitedUserId, user1Id)),
				),
			);
		if (invited) return FriendStatus.INVITED;

		return FriendStatus.FALSE;
	}

	public async removeFriend(userId: string, userFriendId: string): Promise<CommonDto.BooleanResponse> {
		const [removedFriend] = await this.db.db
			.delete(userFriends)
			.where(
				or(
					and(eq(userFriends.userId, userId), eq(userFriends.userFriendId, userFriendId)),
					and(eq(userFriends.userId, userFriendId), eq(userFriends.userFriendId, userId)),
				),
			)
			.returning({
				userId: userFriends.userId,
			});
		if (!removedFriend) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return { success: true };
	}

	public async getSentInvites(userId: string, page: number, limit: number): Promise<FriendDto.InviteEntity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const invites = await this.db.db
			.select({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId })
			.from(userFriendsInvites)
			.where(eq(userFriendsInvites.userId, userId))
			.offset(offset)
			.limit(limit);

		return await Promise.all(
			invites.map(async (inviteRow) => {
				const invitedUser = await this.users.getUser(inviteRow.invitedUserId);

				const invite: FriendDto.InviteEntity = {
					user: {
						id: invitedUser.id,
						name: invitedUser.name,
						username: invitedUser.username,
						avatarFilename: invitedUser.avatarFilename,
						email: invitedUser.email,
					},
				};
				return invite;
			}),
		);
	}

	public async getPendingInvites(userId: string, page: number, limit: number): Promise<FriendDto.InviteEntity[]> {
		const offset = Math.max(0, (page - 1) * limit);

		const invites = await this.db.db
			.select({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId })
			.from(userFriendsInvites)
			.where(eq(userFriendsInvites.invitedUserId, userId))
			.offset(offset)
			.limit(limit);

		return await Promise.all(
			invites.map(async (inviteRow) => {
				const user = await this.users.getUser(inviteRow.userId);

				const invite: FriendDto.InviteEntity = {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						avatarFilename: user.avatarFilename,
						email: user.email,
					},
				};
				return invite;
			}),
		);
	}

	public async sendInvite(fromUserId: string, toUserId: string): Promise<CommonDto.BooleanResponse> {
		if (fromUserId === toUserId) {
			throw new BadRequestException(ERRORS.MISMATCH);
		}

		const [existingInvite] = await this.db.db
			.select({ userId: userFriendsInvites.userId })
			.from(userFriendsInvites)
			.where(and(eq(userFriendsInvites.userId, fromUserId), eq(userFriendsInvites.invitedUserId, toUserId)))
			.limit(1);
		if (existingInvite) {
			throw new BadRequestException(ERRORS.ALREADY_CREATED);
		}

		const [existingFriend] = await this.db.db
			.select()
			.from(userFriends)
			.where(
				or(
					and(eq(userFriends.userId, fromUserId), eq(userFriends.userFriendId, toUserId)),
					and(eq(userFriends.userId, toUserId), eq(userFriends.userFriendId, fromUserId)),
				),
			)
			.limit(1);
		if (existingFriend) {
			throw new BadRequestException(ERRORS.ALREADY_EXISTS);
		}

		await this.db.db.insert(userFriendsInvites).values({ userId: fromUserId, invitedUserId: toUserId });

		this.notifications
			.create(toUserId, {
				type: NotificationType.FRIEND_INVITE,
				relEntityId: fromUserId,
			})
			.catch((r) => {
				console.log('Friend invite notification creation failed', r);
			});

		return { success: true };
	}

	public async acceptInvite(fromUserId: string, toUserId: string): Promise<CommonDto.BooleanResponse> {
		await this.deleteInvite(fromUserId, toUserId);
		await this.db.db.insert(userFriends).values({ userId: fromUserId, userFriendId: toUserId });

		return { success: true };
	}

	/** Отклонить инвайт */
	public async rejectInvite(fromUserId: string, toUserId: string): Promise<CommonDto.BooleanResponse> {
		return await this.deleteInvite(fromUserId, toUserId);
	}

	/** Отозвать инвайт */
	public async revokeInvite(fromUserId: string, toUserId: string): Promise<CommonDto.BooleanResponse> {
		return await this.deleteInvite(fromUserId, toUserId);
	}

	private async deleteInvite(fromUserId: string, toUserId: string): Promise<CommonDto.BooleanResponse> {
		const [inviteRow] = await this.db.db
			.delete(userFriendsInvites)
			.where(and(eq(userFriendsInvites.userId, fromUserId), eq(userFriendsInvites.invitedUserId, toUserId)))
			.returning({ userId: userFriendsInvites.userId });
		if (!inviteRow) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return { success: true };
	}
}
