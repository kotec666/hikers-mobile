import { MMKV } from 'react-native-mmkv'

export const storage = new MMKV({
	id: 'auth-storage'
})

export const setItem = (key: string, value: object) => {
	storage.set(key, JSON.stringify(value))
}

export const getItem = (key: string) => {
	const value = storage.getString(key)
	return value ? JSON.parse(value) : null
}

export const removeItem = (key: string) => {
	storage.delete(key)
}
