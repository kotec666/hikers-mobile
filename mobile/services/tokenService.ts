import { getItem, setItem, removeItem, IAuthStorage } from '@/store/authStorage'

export async function getToken(): Promise<string | null | undefined> {
	const authData = await getItem('authData')
	return authData?.accessToken
}

export async function getAuthData(): Promise<IAuthStorage | null> {
	return await getItem('authData')
}

export async function setAuthData(partial: Partial<IAuthStorage>): Promise<void> {
	const existing = (await getItem('authData')) ?? {}
	await setItem('authData', { ...existing, ...partial })
}

export async function setToken(token: string): Promise<void> {
	const existing = (await getItem('authData')) ?? {}
	await setItem('authData', { ...existing, accessToken: token })
}

export async function removeAuthData(): Promise<void> {
	await removeItem('authData')
}
