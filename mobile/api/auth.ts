import fetcher from '@/api/fetcher'
import {IUser} from "@/store/authStore";

export const loginUser = async (data: {
	email: string
	password: string
}): Promise<IUser & {
	token: string
}> => {
	return (
		await fetcher.post('auth/login', {
			json: data
		})
	).json()
}

export const registrationUser = async (data: {
	email: string
	password: string
}): Promise<IUser & {
    token: string
}> => {
	return (
		await fetcher.post('auth/registration', {
			json: data
		})
	).json()
}

export const refreshAccessTokenRequest = async (data: {
	token: string
}): Promise<{
	token: string
	// user: User
}> => {
	return (
		await fetcher.post('auth/refresh', {
			headers: {
				Authorization: `Bearer ${data.token}`
			}
		})
	).json()
}
