import ky from 'ky'
import { Platform } from 'react-native'
import { api } from '@/constants/Variables'
import { getToken, removeAuthData } from '@/services/tokenService'
import { authStore } from '@/store/authStore'

const baseFetcher = ky.extend({
	prefixUrl: api + '/api',
	mode: Platform.OS === 'ios' ? 'cors' : undefined
	//credentials: "include",
})

// Флаг для предотвращения множественных запросов обновления токена
let isRefreshing = false
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void }[] = []

const processQueue = (error: any, token?: string | null) => {
	failedQueue.forEach(({ resolve, reject }) => {
		if (error) {
			reject(error)
		} else {
			resolve(token)
		}
	})
	failedQueue = []
}

const fetcher = baseFetcher.extend({
	hooks: {
		beforeRequest: [
			async (request) => {
				if (request.url.includes('auth/refresh')) return
				request.headers.set('Authorization', `Bearer ${await getToken()}`)
			}
		],
		afterResponse: [
			async (request, options, response) => {
				// Если ответ успешный, просто возвращаем его
				if (response.status !== 401) {
					return response
				}

				// Получаем оригинальный запрос
				const originalRequest = request

				// Если это запрос на обновление токена, не обрабатываем его
				if (originalRequest.url.includes('auth/refresh') || originalRequest.url.includes('auth/login')) {
					return response
				}

				// Если уже происходит обновление токена, добавляем запрос в очередь
				if (isRefreshing) {
					return new Promise((resolve, reject) => {
						failedQueue.push({ resolve, reject })
					})
						.then((token) => {
							originalRequest.headers.set('Authorization', `Bearer ${token}`)
							return baseFetcher(originalRequest)
						})
						.then((response) => response)
				}

				// Начинаем процесс обновления токена
				isRefreshing = true

				try {
					const ok = await authStore.getState().refreshAccessToken()

					if (!ok) throw new Error('refresh failed')

					const newToken = await getToken()

					processQueue(null, newToken)

					originalRequest.headers.set('Authorization', `Bearer ${newToken}`)
					return baseFetcher(originalRequest)
				} catch (error) {
					// Обрабатываем очередь с ошибкой
					processQueue(error, null)
					// Если обновление токена не удалось, очищаем данные аутентификации
					await removeAuthData()
					// Перенаправляем на страницу логина или показываем ошибку
					console.error('Token refresh failed:', error)
					throw error
				} finally {
					isRefreshing = false
				}
			}
		]
	}
})

export default fetcher
