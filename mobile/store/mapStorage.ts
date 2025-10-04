import { MMKV } from 'react-native-mmkv'

export const mapStorage = new MMKV({
	id: 'map-storage'
})

export const setMapItem = (key: string, value: object) => {
	mapStorage.set(key, JSON.stringify(value))
}

export const getMapItem = (key: string) => {
	const value = mapStorage.getString(key)
	return value ? JSON.parse(value) : null
}

export const removeMapItem = (key: string) => {
	mapStorage.delete(key)
}
