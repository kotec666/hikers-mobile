import fetcher from '@/api/fetcher'
import { IUser } from '@/store/authStore'

export const loginUser = async (data: {
	email: string
	password: string
}): Promise<
	IUser & {
		token: string
	}
> => {
	return (
		await fetcher.post('auth/login', {
			json: data
		})
	).json()
}

// : Promise<
// 	IUser & {
// 		token: string
// 	}
// >
export const registrationUser = async (data: {
	email: string
	username: string
	password: string
	isTermsAccepted: boolean
}): Promise<{
	success: boolean
	waitMs: number
}> => {
	return (
		await fetcher.post('auth/registration', {
			json: data
		})
	).json()
}

// Запросить код подтверждения почты
export const requestConfirmEmailCode = async (
	email: string
): Promise<{
	success: boolean
	waitMs: number
}> => {
	return (
		await fetcher.post('auth/request-confirm-email', {
			json: { email }
		})
	).json()
}

// Ввести код подтверждения почты
export const confirmEmailCode = async (email: string, code: string): Promise<IUser & { token: string }> => {
	return (
		await fetcher.post('auth/confirm-email', {
			json: { email, code }
		})
	).json()
}

// Запросить код восстановления пароля
export const requestPasswordRecoveryCode = async (
	email: string
): Promise<{
	success: boolean
	remainAttempts: number
	waitMs: number
}> => {
	return (
		await fetcher.post('auth/request-password-recovery', {
			json: { email }
		})
	).json()
}

// Ввести код восстановления пароля
export const confirmPasswordRecoveryCode = async (
	code: string,
	email: string
): Promise<{
	success: boolean
	remainAttempts: number
	waitMs: number
}> => {
	return (
		await fetcher.post('auth/confirm-password-recovery', {
			json: { code, email }
		})
	).json()
}

// Восстановить пароль
export const recoverPassword = async (
	code: string,
	email: string,
	password: string,
	confirmPassword: string
): Promise<{
	success: boolean
}> => {
	return (
		await fetcher.post('auth/recover-password', {
			json: { code, email, password, confirmPassword }
		})
	).json()
}
