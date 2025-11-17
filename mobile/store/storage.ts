import { MMKV } from 'react-native-mmkv'
import { IUser } from '@/store/authStore'

export const storage = new MMKV({
	id: 'auth-storage'
})

// authData
export interface IAuthStorage {
	isAuthenticated: boolean
	accessToken: string | null
	user: IUser | null
	accessTokenExpiration: number | null
}

// isAccountExist
export interface IAccountExist {
	accountExist: boolean
}

export const setItem = (key: string, value: Partial<IAuthStorage>) => {
	storage.set(key, JSON.stringify(value))
}

export const setIsAccountExist = (value: IAccountExist) => {
	storage.set('isAccountExist', JSON.stringify(value))
}

export const getIsAccountExist = (): IAccountExist => {
	const value = storage.getString('isAccountExist')
	return value ? JSON.parse(value) : { accountExist: false }
}

export const getItem = (key: string): IAuthStorage | null => {
	const value = storage.getString(key)
	return value ? JSON.parse(value) : null
}

export const removeItem = (key: string) => {
	storage.delete(key)
}
