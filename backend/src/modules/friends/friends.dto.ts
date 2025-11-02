import { UserDto } from '../user/user.dto';

export namespace FriendDto {
	export type Entity = {
		/** Друк для текущего пользователя */
		user: UserDto.Entity;
	};

	export type InviteEntity = {
		user: UserDto.Entity;
	};
}
