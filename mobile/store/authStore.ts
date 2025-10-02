import { create } from 'zustand'
import { getItem, removeItem, setItem } from '@/store/storage'
import { loginUser, refreshAccessTokenRequest, registrationUser } from '@/api/auth'

interface IUser {
	id: number
	name: string
	email: string
	username: string
}

interface AuthStore {
	isAuthenticated: boolean
	accessToken: string | null
	user: IUser | null
	accessTokenExpiration: number | null

	login: (email: string, password: string) => Promise<boolean>
	register: (email: string, password: string) => Promise<boolean>
	logout: () => void
	refreshAccessToken: () => Promise<boolean>
	checkAuth: () => Promise<boolean>
}

export const useAuthStore = create<AuthStore>((set, get) => ({
	isAuthenticated: false,
	accessToken: null,
	user: null,
	accessTokenExpiration: null,

	login: async (email: string, password: string) => {
		try {
			const data = await loginUser({ email, password })

			const authData = {
				accessToken: data.token,
				user: {
					// firstName: data.firstName,
					// lastName: data.lastName,
					// email: data.email,
					// username: data.username
					id: 1,
					name: 'Сергей Авдотьев',
					email: email,
					username: 'oxxxysergey'
				},
				isAuthenticated: true,
				accessTokenExpiration: Date.now() + 30 * 60 * 1000 // 30 min
			}
			setItem('authData', authData)
			set(authData)

			return true
		} catch (e) {
			console.log(e)
			return false
		}
	},
	register: async (email: string, password: string) => {
		try {
			const data = await registrationUser({ email, password })

			const authData = {
				accessToken: data.token,
				user: {
					// firstName: data.firstName,
					// lastName: data.lastName,
					// email: data.email,
					// username: data.username
					id: 1,
					name: 'Сергей Авдотьев',
					email: email,
					username: 'oxxxysergey'
				},
				isAuthenticated: true,
				accessTokenExpiration: Date.now() + 30 * 60 * 1000 // 30 min
			}

			setItem('authData', authData)
			set(authData)

			return true
		} catch (e) {
			console.log(e)
			return false
		}
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
