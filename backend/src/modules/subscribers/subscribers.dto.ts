import { UserDto } from '../user/user.dto';

export namespace SubscriberDto {
	export type Entity = {
		/** Подписчик для текущего пользователя */
		user: UserDto.Entity;
	};
}

export namespace SubscriptionDto {
	export type Entity = {
		/** Тот, на кого подписан текущий пользователь */
		user: UserDto.Entity;
	};
}
