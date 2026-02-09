import { Controller, Delete, Get, Param, Patch, Post, UseInterceptors } from '@nestjs/common';
import { UserInterceptor } from '../../common/interceptors/user.interceptor';
import { FriendsService } from './friends.service';
import { User, UserData } from '../../common/decorators/user.decorator';
import { FriendDto } from './friends.dto';
import { IsUUID } from '@validation/parameter-decorators';
import { CommonDto } from '../../common/dto/common.dto';

@Controller('friends')
@UseInterceptors(UserInterceptor)
export class FriendsController {
	constructor(private readonly service: FriendsService) {}

	/**
	 * @tag Friends
	 * @summary Получить всех друзей
	 * @security token
	 */
	@Get()
	public async getFriends(@User() user: UserData): Promise<FriendDto.Entity[]> {
		return this.service.getFriends(user.id);
	}

	/**
	 * @tag Friends
	 * @summary Получить друга по его id
	 * @security token
	 */
	@Get(':friendId')
	public async getFriend(
		@User() user: UserData,
		@IsUUID('friendId') @Param('friendId') friendId: string,
	): Promise<FriendDto.Entity> {
		return this.service.getFriend(user.id, friendId);
	}

	/**
	 * @tag Friends
	 * @summary Удалить юзера из своих друзей по его id
	 * @security token
	 */
	@Delete(':friendId')
	public async removeFriend(
		@User() user: UserData,
		@Param('friendId') friendId: string,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.removeFriend(user.id, friendId);
	}

	/**
	 * @tag Friends
	 * @summary Получить все исходящие (ожидающие) запросы в друзья
	 * @security token
	 */
	@Get('invites/sent')
	public async getSentInvites(@User() user: UserData): Promise<FriendDto.InviteEntity[]> {
		return this.service.getSentInvites(user.id);
	}

	/**
	 * @tag Friends
	 * @summary Получить все входящие (ожидающие) заявки в друзья
	 * @security token
	 */
	@Get('invites/pending')
	public async getPendingInvites(@User() user: UserData): Promise<FriendDto.InviteEntity[]> {
		return this.service.getPendingInvites(user.id);
	}

	/**
	 * @tag Friends
	 * @summary Отправить запрос в друзья юзеру по его id
	 * @security token
	 */
	@Post('invites/send/:userId')
	public async sendInvite(
		@User() user: UserData,
		@Param('userId') toUserId: string,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.sendInvite(user.id, toUserId);
	}

	/**
	 * @tag Friends
	 * @summary Принять запрос в друзья по id будущего друга
	 * @security token
	 */
	@Patch('invites/accept/:userId')
	public async acceptInvite(
		@User() user: UserData,
		@Param('userId') fromUserId: string,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.acceptInvite(fromUserId, user.id);
	}

	/**
	 * @tag Friends
	 * @summary Отклонить запрос в друзья по id будущего недруга 0_o
	 * @security token
	 */
	@Patch('invites/reject/:userId')
	public async rejectInvite(
		@User() user: UserData,
		@Param('userId') fromUserId: string,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.rejectInvite(fromUserId, user.id);
	}

	/**
	 * @tag Friends
	 * @summary Отозвать свой запрос в друзья к юзеру по его id
	 * @security token
	 */
	@Delete('invites/revoke/:userId')
	public async revokeInvite(
		@User() user: UserData,
		@Param('userId') toUserId: string,
	): Promise<CommonDto.BooleanResponse> {
		return this.service.revokeInvite(user.id, toUserId);
	}
}
