import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FriendDto } from './friends.dto';
import { userFriends, userFriendsInvites } from '../database/schema';
import { eq, and, or } from 'drizzle-orm';
import { ERRORS } from '@shared/errors';

@Injectable()
export class FriendsService {
	constructor(private readonly db: DatabaseService) {}

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

		return friends.map((friendRow) => ({
			userId: friendRow.userId === userId ? friendRow.userId : friendRow.userFriendId,
			createdAt: friendRow.createdAt,
		}));
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

		return {
			userId: removedFriend.userId === userId ? removedFriend.userId : removedFriend.userFriendId,
			createdAt: removedFriend.createdAt,
		};
	}

	public async getSentInvites(userId: string): Promise<FriendDto.InviteEntity[]> {
		return await this.db.db
			.select({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId })
			.from(userFriendsInvites)
			.where(eq(userFriendsInvites.userId, userId));
	}

	public async getPendingInvites(userId: string): Promise<FriendDto.InviteEntity[]> {
		return await this.db.db
			.select({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId })
			.from(userFriendsInvites)
			.where(eq(userFriendsInvites.invitedUserId, userId));
	}

	public async sendInvite(fromUserId: string, toUserId: string): Promise<FriendDto.InviteEntity> {
		const [existingInvite] = await this.db.db
			.select({ id: userFriendsInvites.id })
			.from(userFriendsInvites)
			.where(and(eq(userFriendsInvites.userId, fromUserId), eq(userFriendsInvites.invitedUserId, toUserId)))
			.limit(1);
		if (!existingInvite) {
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

		const [invite] = await this.db.db
			.insert(userFriendsInvites)
			.values({ userId: fromUserId, invitedUserId: toUserId })
			.returning({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId });

		return invite;
	}

	public async acceptInvite(inivteId: string): Promise<FriendDto.Entity> {
		const [invite] = await this.db.db
			.delete(userFriendsInvites)
			.where(eq(userFriendsInvites.id, inivteId))
			.returning({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId });
		if (!invite) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		const [friend] = await this.db.db
			.insert(userFriends)
			.values({ userId: invite.userId, userFriendId: invite.invitedUserId })
			.returning({
				userId: userFriends.userId,
				userFriendId: userFriends.userFriendId,
				createdAt: userFriends.createdAt,
			});

		return friend;
	}

	public async rejectInvite(inivteId: string): Promise<FriendDto.InviteEntity> {
		const [invite] = await this.db.db
			.delete(userFriendsInvites)
			.where(eq(userFriendsInvites.id, inivteId))
			.returning({ userId: userFriendsInvites.userId, invitedUserId: userFriendsInvites.invitedUserId });
		if (!invite) {
			throw new NotFoundException(ERRORS.NOT_FOUND);
		}

		return invite;
	}
}
