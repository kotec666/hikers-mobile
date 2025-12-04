import { getItem, setItem, removeItem, IAuthStorage } from '@/store/storage'

export function getToken() {
	return getItem('authData')?.accessToken ?? null
}

export function getAuthData(): IAuthStorage | null {
	return getItem('authData')
}

export function setAuthData(partial: Partial<IAuthStorage>) {
	const existing = getItem('authData') ?? {}
	setItem('authData', { ...existing, ...partial })
}

export function setToken(token: string) {
	const existing = getItem('authData') ?? {}
	setItem('authData', { ...existing, accessToken: token })
}

export function removeAuthData() {
	removeItem('authData')
}
