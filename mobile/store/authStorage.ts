import * as SecureStore from 'expo-secure-store'
import { IUser } from '@/store/authStore'

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

// setItem
export const setItem = async (key: string, value: Partial<IAuthStorage>) => {
	await SecureStore.setItemAsync(key, JSON.stringify(value))
}

// setIsAccountExist
export const setIsAccountExist = async (value: IAccountExist) => {
	await SecureStore.setItemAsync('isAccountExist', JSON.stringify(value))
}

// getIsAccountExist
export const getIsAccountExist = async (): Promise<IAccountExist> => {
	const value = await SecureStore.getItemAsync('isAccountExist')
	return value ? JSON.parse(value) : { accountExist: false }
}

// getItem
export const getItem = async (key: string): Promise<IAuthStorage | null> => {
	const value = await SecureStore.getItemAsync(key)
	return value ? JSON.parse(value) : null
}

// removeItem
export const removeItem = async (key: string) => {
	await SecureStore.deleteItemAsync(key)
}
