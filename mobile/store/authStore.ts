import { create } from 'zustand'
import { getAuthData, removeAuthData, setAuthData } from '@/services/tokenService'
import { refreshTokenAPI } from '@/api/refresh'
import { getTokenExpirationTime } from '@/helpers/getTokenExpirationTime'
import { isAuthFailureError } from '@/helpers/authError'
import { setIsAccountExist } from '@/store/authStorage'
import { getWorkoutMeta } from '@/store/workoutStorage'
import { queryClient } from '@/queries/queryClient'

export interface IUser {
	id: string
	name: null | string
	username: string
	color: string
	badge: string | null
	avatarFilename: null | string
}

// signed-in — токен обновлён; logged-out — рефреш отклонён сервером и сессия сброшена;
// kept-session — рефреш не удался (сеть/сервер недоступны или идёт активная тренировка), сессия сохранена.
export type RefreshResult = 'signed-in' | 'kept-session' | 'logged-out'

interface AuthStore {
	// accessToken: string | null
	user: IUser | null
	accessTokenExpiration: number | null
	isAuthenticated: boolean
	isAuthChecked: boolean

	login: (token: string, user: IUser, accessTokenExpiration?: number | null) => Promise<void>
	logout: () => Promise<void>
	refreshAccessToken: () => Promise<RefreshResult>
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
		await queryClient.cancelQueries()
		queryClient.clear()
		set({
			isAuthenticated: false,
			// accessToken: null,
			user: null,
			accessTokenExpiration: null
		})
	},

	refreshAccessToken: async (): Promise<RefreshResult> => {
		const authData = await getAuthData()
		const accessToken = authData?.accessToken
		const user = authData?.user ?? get().user
		if (!accessToken) return 'logged-out'

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
				accessTokenExpiration: expiration,
				isAuthenticated: true,
				user
			})

			return 'signed-in'
		} catch (error) {
			// Сессию сбрасываем только если сервер явно отклонил refresh token.
			// Если идёт активная тренировка или проблемы с соединением (сеть, 5xx,
			// таймаут) — не разлогиниваемся: рефреш повторится при следующем запросе.
			const isWorkoutActive = !!user && !!getWorkoutMeta(user.id)
			if (isWorkoutActive || !isAuthFailureError(error)) {
				return 'kept-session'
			}

			await get().logout()
			return 'logged-out'
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

		const result = await get().refreshAccessToken()

		set({ isAuthChecked: true, isAuthenticated: result !== 'logged-out' })
	}
}))

export const authStore = useAuthStore
