import fetcher from '@/api/fetcher'
import { IUser } from '@/store/authStore'

export const loginUser = async (data: {
	email: string
	password: string
}): Promise<
	IUser & {
		token: string
	}
> => {
	return (
		await fetcher.post('auth/login', {
			json: data
		})
	).json()
}

export const registrationUser = async (data: {
	email: string
	password: string
}): Promise<
	IUser & {
		token: string
	}
> => {
	return (
		await fetcher.post('auth/registration', {
			json: data
		})
	).json()
}
