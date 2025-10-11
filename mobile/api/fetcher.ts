import ky from 'ky'
import { Platform } from 'react-native'
import { api } from '@/constants/Variables'
import { getItem, removeItem } from '@/store/storage'
import { authStore } from '@/store/authStore'

const baseFetcher = ky.extend({
	prefixUrl: api + '/api',
	mode: Platform.OS === 'ios' ? 'cors' : undefined
	//credentials: "include",
})

// Флаг для предотвращения множественных запросов обновления токена
let isRefreshing = false
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void }[] = []

const processQueue = (error: any, token?: string) => {
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
				request.headers.set('Authorization', `Bearer ${getItem('authData')?.accessToken}`)
			}
		],
		afterResponse: [
			async (request, options, response) => {
				console.log('request.headers', request.headers)
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
					const accessToken = getItem('authData')?.accessToken

					if (!accessToken) {
						throw new Error('No refresh token available')
					}

					await authStore.getState().refreshAccessToken()

					console.log('Обновлённый токен', getItem('authData')?.accessToken)
					// Обновляем заголовок авторизации оригинального запроса
					originalRequest.headers.set('Authorization', `Bearer ${getItem('authData')?.accessToken}`)

					// Обрабатываем очередь ожидающих запросов
					processQueue(null, getItem('authData')?.accessToken)

					// Повторяем оригинальный запрос с новым токеном
					return baseFetcher(originalRequest)
				} catch (error) {
					// Если обновление токена не удалось, очищаем данные аутентификации
					removeItem('authData')
					authStore.getState().logout()

					// Обрабатываем очередь с ошибкой
					processQueue(error, undefined)

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
