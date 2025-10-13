export namespace FriendDto {
	export type Entity = {
		/** Айди друга для пользователя, отправившего запрос */
		userId: string;
		/** Дата когда стали друзьями */
		createdAt: Date;
	};

	export type InviteEntity = {
		userId: string;
		invitedUserId: string;
	};
}
