import { create } from 'zustand'
import { getAuthData, removeAuthData, setAuthData } from '@/services/tokenService'
import { refreshTokenAPI } from '@/api/refresh'
import { getTokenExpirationTime } from '@/helpers/getTokenExpirationTime'
import { setIsAccountExist } from '@/store/authStorage'

export interface IUser {
	id: string
	name: null | string
	username: string
	color: string
	badge: string | null
	avatarFilename: null | string
}

interface AuthStore {
	// accessToken: string | null
	user: IUser | null
	accessTokenExpiration: number | null
	isAuthenticated: boolean
	isAuthChecked: boolean

	login: (token: string, user: IUser, accessTokenExpiration?: number | null) => Promise<void>
	logout: () => Promise<void>
	refreshAccessToken: () => Promise<boolean>
	checkAuth: () => Promise<void>
	setUser: (user: IUser) => void
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	// accessToken: null,
	user: null,
	accessTokenExpiration: null,
	isAuthenticated: false,
	isAuthChecked: false,

	login: async (token, user, expire) => {
		const tokenExpiration = expire ?? getTokenExpirationTime()
		await setAuthData({
			accessToken: token,
			user,
			isAuthenticated: true,
			accessTokenExpiration: tokenExpiration
		})
		await setIsAccountExist({ accountExist: true })
		set({
			user,
			isAuthenticated: true,
			accessTokenExpiration: tokenExpiration
		})
	},

	setUser: (user: IUser) => {
		set({ user })
		void setAuthData({ user })
	},

	logout: async () => {
		await removeAuthData()
		set({
			isAuthenticated: false,
			// accessToken: null,
			user: null,
			accessTokenExpiration: null
		})
	},

	refreshAccessToken: async () => {
		const { user } = get()
		const authData = await getAuthData()
		const accessToken = authData?.accessToken
		if (!accessToken) return false

		try {
			const newToken = await refreshTokenAPI(accessToken)
			const expiration = getTokenExpirationTime()

			await setAuthData({
				accessToken: newToken.token,
				accessTokenExpiration: expiration,
				isAuthenticated: true,
				user
			})

			set({
				// accessToken: newToken.token,
				accessTokenExpiration: expiration
			})

			return true
		} catch {
			await get().logout()
			return false
		}
	},

	checkAuth: async () => {
		const data = await getAuthData()
		if (!data) {
			set({ isAuthChecked: true })
			return
		}

		const { accessToken, accessTokenExpiration } = data

		if (accessToken && accessTokenExpiration && accessTokenExpiration > Date.now()) {
			set({ ...data, isAuthChecked: true })
			return
		}

		await get().refreshAccessToken()

		set({ isAuthChecked: true })
	}
}))

export const authStore = useAuthStore
