import { create } from 'zustand'
import { getItem, removeItem, setItem } from '@/store/storage'
import { refreshAccessTokenRequest, registrationUser } from '@/api/auth'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'

export interface IUser {
	id: string
	name: null | string
	email: string
	username: string
    avatarFilename: null | string
}

interface AuthStore {
	isAuthenticated: boolean
	accessToken: string | null
	user: IUser | null
	accessTokenExpiration: number | null

	login: (token: string, user: IUser) => void
	logout: () => void
	refreshAccessToken: () => Promise<boolean>
	checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuthenticated: false,
	accessToken: null,
	user: null,
	accessTokenExpiration: null,

	login: (token: string, user: IUser) => {
		const authData = {
			accessToken: token,
			user,
			isAuthenticated: true,
			accessTokenExpiration: Date.now() + 30 * 60 * 1000 // 30 min
		}
		setItem('authData', authData)
		set(authData)
	},
	logout: () => {
		removeItem('authData')
		set({
			isAuthenticated: false,
			accessToken: null,
			user: null,
			accessTokenExpiration: null
		})
	},

	refreshAccessToken: async () => {
		try {
			const { accessToken } = get()
			if (!accessToken) {
				console.error('Ошибка при обновлении access token: токен не существует')
				return false
			}

			console.log('старый бог', accessToken)
			const data = await refreshAccessTokenRequest({ token: accessToken })

			const updatedAuthData = {
				...get(),
				accessToken: data.token,
				accessTokenExpiration: Date.now() + 30 * 60 * 1000 // 30 min
			}

			set(updatedAuthData)
			setItem('authData', updatedAuthData)
			return true
		} catch (e) {
			console.error('Ошибка при обновлении access token:', e)
			get().logout()
			return false
		}
	},

	checkAuth: async () => {
		const authData = getItem('authData')
		if (!authData) {
			return false
		}

		const { accessToken, accessTokenExpiration, refreshToken } = authData

		if (accessToken && accessTokenExpiration && accessTokenExpiration > Date.now()) {
			set(authData)
			return true
		}

		if (refreshToken) {
			set(authData)
			return await get().refreshAccessToken()
		}

		return false
	}
}))

export const authStore = useAuthStore
