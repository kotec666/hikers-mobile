import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FriendDto } from './friends.dto';
import { userFriends, userFriendsInvites } from '../database/schema';
import { eq, and, or } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';
import { UserService } from '../user/user.service';

@Injectable()
export class FriendsService {
	constructor(
		private readonly db: DatabaseService,
		private readonly users: UserService,
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
			createdAt: friendRow.createdAt,
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

	public async getFriends(userId: string): Promise<FriendDto.Entity[]> {
		// @TODO пагинация
		const friends = await this.db.db
			.select({
				userId: userFriends.userId,
				userFriendId: userFriends.userFriendId,
				createdAt: userFriends.createdAt,
			})
			.from(userFriends)
			.where(or(eq(userFriends.userId, userId), eq(userFriends.userFriendId, userId)));

		return await Promise.all(
			friends.map(async (friendRow) => {
				const friendUserId = friendRow.userId === userId ? friendRow.userFriendId : friendRow.userId;
				const friendUser = await this.users.getUser(friendUserId);

				const friend: FriendDto.Entity = {
					createdAt: friendRow.createdAt,
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

	public async removeFriend(userId: string, userFriendId: string): Promise<FriendDto.Entity> {
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
				userFriendId: userFriends.userFriendId,
				createdAt: userFriends.createdAt,
			});
		if (!removedFriend) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const friendUserId = removedFriend.userId === userId ? removedFriend.userFriendId : removedFriend.userId;
		const friendUser = await this.users.getUser(friendUserId);

		const friend: FriendDto.Entity = {
			createdAt: removedFriend.createdAt,
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

	public async getSentInvites(userId: string): Promise<FriendDto.InviteEntity[]> {
		const invites = await this.db.db
			.select({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId })
			.from(userFriendsInvites)
			.where(eq(userFriendsInvites.userId, userId));

		return await Promise.all(
			invites.map(async (inviteRow) => {
				const user = await this.users.getUser(inviteRow.userId);
				const invitedUser = await this.users.getUser(inviteRow.invitedUserId);

				const invite: FriendDto.InviteEntity = {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						avatarFilename: user.avatarFilename,
						email: user.email,
					},
					invitedUser: {
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

	public async getPendingInvites(userId: string): Promise<FriendDto.InviteEntity[]> {
		const invites = await this.db.db
			.select({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId })
			.from(userFriendsInvites)
			.where(eq(userFriendsInvites.invitedUserId, userId));

		return await Promise.all(
			invites.map(async (inviteRow) => {
				const user = await this.users.getUser(inviteRow.userId);
				const invitedUser = await this.users.getUser(inviteRow.invitedUserId);

				const invite: FriendDto.InviteEntity = {
					user: {
						id: user.id,
						name: user.name,
						username: user.username,
						avatarFilename: user.avatarFilename,
						email: user.email,
					},
					invitedUser: {
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

	public async sendInvite(fromUserId: string, toUserId: string): Promise<FriendDto.InviteEntity> {
		const [existingInvite] = await this.db.db
			.select({ id: userFriendsInvites.id })
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
			throw new BadRequestException(ERRORS.MISMATCH);
		}

		const user = await this.users.getUser(fromUserId);
		const invitedUser = await this.users.getUser(toUserId);

		await this.db.db.insert(userFriendsInvites).values({ userId: fromUserId, invitedUserId: toUserId });

		const invite: FriendDto.InviteEntity = {
			user: {
				id: user.id,
				name: user.name,
				username: user.username,
				avatarFilename: user.avatarFilename,
				email: user.email,
			},
			invitedUser: {
				id: invitedUser.id,
				name: invitedUser.name,
				username: invitedUser.username,
				avatarFilename: invitedUser.avatarFilename,
				email: invitedUser.email,
			},
		};
		return invite;
	}

	public async acceptInvite(fromUserId: string, toUserId: string): Promise<FriendDto.Entity> {
		const [invite] = await this.db.db
			.delete(userFriendsInvites)
			.where(and(eq(userFriendsInvites.userId, fromUserId), eq(userFriendsInvites.invitedUserId, toUserId)))
			.returning({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId });
		if (!invite) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const [friendRow] = await this.db.db
			.insert(userFriends)
			.values({ userId: invite.userId, userFriendId: invite.invitedUserId })
			.returning({
				userId: userFriends.userId,
				userFriendId: userFriends.userFriendId,
				createdAt: userFriends.createdAt,
			});

		const friendUser = await this.users.getUser(invite.userId);
		const friend: FriendDto.Entity = {
			createdAt: friendRow.createdAt,
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

	public async rejectInvite(fromUserId: string, toUserId: string): Promise<FriendDto.InviteEntity> {
		const [inviteRow] = await this.db.db
			.delete(userFriendsInvites)
			.where(and(eq(userFriendsInvites.userId, fromUserId), eq(userFriendsInvites.invitedUserId, toUserId)))
			.returning({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId });
		if (!inviteRow) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const user = await this.users.getUser(inviteRow.userId);
		const invitedUser = await this.users.getUser(inviteRow.invitedUserId);

		const invite: FriendDto.InviteEntity = {
			user: {
				id: user.id,
				name: user.name,
				username: user.username,
				avatarFilename: user.avatarFilename,
				email: user.email,
			},
			invitedUser: {
				id: invitedUser.id,
				name: invitedUser.name,
				username: invitedUser.username,
				avatarFilename: invitedUser.avatarFilename,
				email: invitedUser.email,
			},
		};
		return invite;
	}

	public async revokeInvite(fromUserId: string, toUserId: string): Promise<FriendDto.InviteEntity> {
		const [inviteRow] = await this.db.db
			.delete(userFriendsInvites)
			.where(and(eq(userFriendsInvites.userId, fromUserId), eq(userFriendsInvites.invitedUserId, toUserId)))
			.returning({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId });
		if (!inviteRow) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const user = await this.users.getUser(inviteRow.userId);
		const invitedUser = await this.users.getUser(inviteRow.invitedUserId);

		const invite: FriendDto.InviteEntity = {
			user: {
				id: user.id,
				name: user.name,
				username: user.username,
				avatarFilename: user.avatarFilename,
				email: user.email,
			},
			invitedUser: {
				id: invitedUser.id,
				name: invitedUser.name,
				username: invitedUser.username,
				avatarFilename: invitedUser.avatarFilename,
				email: invitedUser.email,
			},
		};
		return invite;
	}
}
