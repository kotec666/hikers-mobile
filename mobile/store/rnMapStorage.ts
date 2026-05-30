import { createMMKV } from 'react-native-mmkv'
import { Camera } from 'react-native-maps'

export const mapStorage = createMMKV({
	id: 'rn-map-storage'
})

const mapStorageKey = 'RN_MAP_STORAGE_SETTINGS'

const initialMapSettings: Camera = {
	center: { latitude: 55.758745, longitude: 37.619153 }, // Moscow
	altitude: 400_000, // аналог zoom
	heading: 0,
	pitch: 0
}

export const getRNMapSettings = (): Camera => {
	const mapStorageStr = mapStorage.getString(mapStorageKey)
	let parsedStorage = null

	if (mapStorageStr) {
		parsedStorage = JSON.parse(mapStorageStr) as Camera
	}

	if (mapStorageStr && parsedStorage) {
		return parsedStorage
	} else {
		mapStorage.set(mapStorageKey, JSON.stringify(initialMapSettings))
		return initialMapSettings
	}
}

export const updateRNMapSettings = (settings: Partial<Camera>) => {
	const mapStorageStr = mapStorage.getString(mapStorageKey)
	let parsedStorage = null

	if (mapStorageStr) {
		parsedStorage = JSON.parse(mapStorageStr) as Camera
	}

	if (parsedStorage) {
		const updatedSettings: Camera = {
			...parsedStorage,
			...settings
		}
		return mapStorage.set(mapStorageKey, JSON.stringify(updatedSettings))
	} else {
		const updatedSettings: Camera = {
			...initialMapSettings,
			...settings
		}
		return mapStorage.set(mapStorageKey, JSON.stringify(updatedSettings))
	}
}

// export const removeMapStorage = () => {
// 	mapStorage.remove(mapStorageKey)
// }
