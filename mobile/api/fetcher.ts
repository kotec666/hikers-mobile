import ky from 'ky'
import { Platform } from 'react-native'
import { api } from '@/constants/Variables'
import { getAuthData } from '@/services/tokenService'
import { authStore } from '@/store/authStore'
import { EXPIRATION_BUFFER_MS } from '@/helpers/getTokenExpirationTime'

const baseFetcher = ky.extend({
	prefixUrl: api + '/api',
	mode: Platform.OS === 'ios' ? 'cors' : undefined
})

// Дедупликация параллельных рефрешей
let refreshPromise: Promise<boolean> | null = null

const ensureFreshToken = async (): Promise<string | null | undefined> => {
	const authData = await getAuthData()

	if (!authData?.accessToken) return authData?.accessToken

	const isExpiredOrExpiring =
		!authData.accessTokenExpiration || authData.accessTokenExpiration <= Date.now() + EXPIRATION_BUFFER_MS

	if (!isExpiredOrExpiring) {
		return authData.accessToken
	}

	// Токен истёк/истекает — рефрешим (если рефреш уже идёт, просто ждём его же промис)
	if (!refreshPromise) {
		refreshPromise = authStore
			.getState()
			.refreshAccessToken()
			.finally(() => {
				refreshPromise = null
			})
	}

	const ok = await refreshPromise

	if (!ok) {
		await authStore.getState().logout()
		return null
	}

	const freshData = await getAuthData()
	return freshData?.accessToken
}

const fetcher = baseFetcher.extend({
	hooks: {
		beforeRequest: [
			async (request) => {
				if (request.url.includes('auth/refresh') || request.url.includes('auth/login')) return

				const token = await ensureFreshToken()

				if (!token) {
					// Рефреш не удался — отдаём запрос без токена,
					// пусть сервер честно вернёт 401 и это дойдёт до вызывающего кода как обычная ошибка
					return
				}

				request.headers.set('Authorization', `Bearer ${token}`)
			}
		]
		// afterResponse больше не нужен для 401 — токен всегда актуален ДО отправки запроса.
		// Если 401 всё же прилетит (например, токен отозван на бэкенде до истечения),
		// он просто долетит до onError мутации/query как обычная ошибка авторизации.
	}
})

export default fetcher
