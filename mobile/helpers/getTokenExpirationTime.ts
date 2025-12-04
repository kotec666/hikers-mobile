export const getTokenExpirationTime = () => {
	// Date.now() + 30 * 1000 // 30 секунд
	return Date.now() + 30 * 60 * 1000 // 30 минут
}
