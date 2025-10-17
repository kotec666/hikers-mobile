import { UserDto } from '../user/user.dto';

export namespace FriendDto {
	export type Entity = {
		/** Друк для текущего пользователя */
		user: UserDto.Entity;
		/** Дата когда стали друзьями */
		createdAt: Date;
	};

	export type InviteEntity = {
		user: UserDto.Entity;
		invitedUser: UserDto.Entity;
	};
}
