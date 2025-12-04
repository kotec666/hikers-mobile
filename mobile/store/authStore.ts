import { create } from 'zustand'
import { getAuthData, removeAuthData, setAuthData } from '@/services/tokenService'
import { refreshTokenAPI } from '@/api/refresh'
import { getTokenExpirationTime } from '@/helpers/getTokenExpirationTime'
import { setIsAccountExist } from '@/store/storage'

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

	login: (token: string, user: IUser, accessTokenExpiration?: number | null) => void
	logout: () => void
	refreshAccessToken: () => Promise<boolean>
	checkAuth: () => Promise<boolean>
	setUser: (user: IUser) => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuthenticated: false,
	accessToken: null,
	user: null,
	accessTokenExpiration: null,

	login: (token, user, expire) => {
		const data = {
			accessToken: token,
			user,
			isAuthenticated: true,
			accessTokenExpiration: expire ?? getTokenExpirationTime()
		}

		setAuthData(data)
		setIsAccountExist({ accountExist: true })
		set(data)
	},

	setUser: (user: IUser) => {
		set({ user })
	},

	logout: () => {
		removeAuthData()
		set({
			isAuthenticated: false,
			accessToken: null,
			user: null,
			accessTokenExpiration: null
		})
	},

	refreshAccessToken: async () => {
		const { accessToken, user } = get()
		if (!accessToken) return false

		try {
			const newToken = await refreshTokenAPI(accessToken)
			const expiration = getTokenExpirationTime()

			setAuthData({
				accessToken: newToken.token,
				accessTokenExpiration: expiration,
				isAuthenticated: true,
				user
			})

			set({
				accessToken: newToken.token,
				accessTokenExpiration: expiration
			})

			return true
		} catch (err) {
			get().logout()
			return false
		}
	},

	checkAuth: async () => {
		const data = getAuthData()
		if (!data) return false

		const { accessToken, accessTokenExpiration } = data

		if (accessToken && accessTokenExpiration && accessTokenExpiration > Date.now()) {
			set(data)
			return true
		}

		return await get().refreshAccessToken()
	}
}))

export const authStore = useAuthStore
