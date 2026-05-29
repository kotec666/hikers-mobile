import { createMMKV } from 'react-native-mmkv'
import { InitialRegion } from 'react-native-yamap-plus'

export const mapStorage = createMMKV({
	id: 'ya-map-storage'
})

const mapStorageKey = 'YA_MAP_STORAGE_SETTINGS'

const initialMapSettings: InitialRegion = {
	lat: 55.758745, // Moscow
	lon: 37.619153, // Moscow
	zoom: 14,
	azimuth: undefined
	// tilt: 0
}

export const getYaMapSettings = (): InitialRegion => {
	const mapStorageStr = mapStorage.getString(mapStorageKey)
	let parsedStorage = null

	if (mapStorageStr) {
		parsedStorage = JSON.parse(mapStorageStr) as InitialRegion
	}

	if (mapStorageStr && parsedStorage) {
		return parsedStorage
	} else {
		mapStorage.set(mapStorageKey, JSON.stringify(initialMapSettings))
		return initialMapSettings
	}
}

export const updateYaMapSettings = (settings: Partial<InitialRegion>) => {
	const mapStorageStr = mapStorage.getString(mapStorageKey)
	let parsedStorage = null

	if (mapStorageStr) {
		parsedStorage = JSON.parse(mapStorageStr) as InitialRegion
	}

	if (parsedStorage) {
		const updatedSettings: InitialRegion = {
			...parsedStorage,
			...settings
		}
		return mapStorage.set(mapStorageKey, JSON.stringify(updatedSettings))
	} else {
		const updatedSettings: InitialRegion = {
			...initialMapSettings,
			...settings
		}
		return mapStorage.set(mapStorageKey, JSON.stringify(updatedSettings))
	}
}

// export const removeMapStorage = () => {
// 	mapStorage.remove(mapStorageKey)
// }
