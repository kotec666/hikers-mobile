export interface IUser {
	id: string
	name: null | string
	email: string
	username: null | string
	avatarFilename: null | string
}

export type IPublicUser = Omit<IUser, 'email'>
