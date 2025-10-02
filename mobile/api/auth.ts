import fetcher from '@/api/fetcher'

export const loginUser = async (data: {
	email: string
	password: string
}): Promise<{
	token: string
	// user: User
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
}): Promise<{
	token: string
	// user: User
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
