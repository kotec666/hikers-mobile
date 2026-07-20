export const getTokenExpirationTime = () => {
	// return Date.now() + 30 * 1000 // 30 секунд
	return Date.now() + 30 * 60 * 1000 // 30 минут
}

// Небольшой запас, чтобы не отправлять запрос с токеном,
// который истечёт прямо во время полёта запроса
export const EXPIRATION_BUFFER_MS = 5000
