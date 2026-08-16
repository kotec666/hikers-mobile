import { isHTTPError, isTimeoutError } from 'ky'

// Статусы, при которых рефреш однозначно отклонён сервером (refresh token невалиден).
// 429 — rate limit: рефреш может повториться позже, разлогиниваться не нужно.
const isAuthFailureStatus = (status: number): boolean => status >= 400 && status < 500 && status !== 429

// Сервер явно отклонил refresh token (или API ответил ошибкой клиента).
// Любая другая ошибка (нет соединения, таймаут, 5xx, 429, прерванный запрос)
// не является признаком невалидной сессии — при таких ошибках разлогиниваться нельзя.
export const isAuthFailureError = (error: unknown): boolean => {
	if (isTimeoutError(error)) return false
	if (error instanceof Error && error.name === 'AbortError') return false
	if (isHTTPError(error)) return isAuthFailureStatus(error.response.status)
	return false
}

const NETWORK_MESSAGE_FRAGMENTS = [
	'network request failed',
	'network error',
	'failed to fetch',
	'failed to connect',
	'could not connect',
	'connection closed',
	'connection reset',
	'connection refused',
	'econnrefused',
	'etimedout',
	'enotfound',
	'eai_again',
	'no address associated',
	'host unreachable',
	'unable to resolve',
	'name or service not known',
	'no route to host',
	'socket hang up',
	'socket closed',
	'internet connection appears'
] as const

const hasNetworkMessageFragment = (message: string): boolean => {
	const lower = message.toLowerCase()
	return NETWORK_MESSAGE_FRAGMENTS.some((fragment) => lower.includes(fragment))
}

// Ошибка соединения на уровне сети: нет интернета, сервер недоступен,
// DNS не резолвится, запрос оборван. Такие ошибки не имеют HTTP-ответа.
export const isConnectivityError = (error: unknown): boolean => {
	if (isTimeoutError(error)) return false
	// fetch при отсутствии сети на RN бросает TypeError (классическое "Network request failed")
	if (error instanceof TypeError) return true
	if (typeof error === 'object' && error !== null && (error as { name?: unknown }).name === 'AbortError') {
		return true
	}
	if (error instanceof Error && hasNetworkMessageFragment(error.message)) return true
	return false
}
