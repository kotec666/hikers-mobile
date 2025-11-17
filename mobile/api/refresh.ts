import ky from 'ky'
import { api } from '@/constants/Variables'

export const refreshTokenAPI = async (token: string): Promise<{ token: string }> => {
	return (
		await ky.post(api + '/api/auth/refresh', {
			headers: {
				Authorization: `Bearer ${token}`
			}
		})
	).json()
}
