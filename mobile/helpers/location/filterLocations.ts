import { LocationObject } from 'expo-location'

/**
 * Фильтрует массив локаций
 * @param locations массив LocationObject
 * @param options
 * @param options.isMockAllowed — разрешать mock точки
 * @param options.keepLast — оставлять последнюю точку с одинаковым timestamp
 */
export const filterLocations = (
	locations: LocationObject[],
	options: { isMockAllowed?: boolean; keepLast?: boolean } = {}
): LocationObject[] => {
	const { keepLast = false } = options
	const isMockAllowed = options.isMockAllowed ?? __DEV__

	// Сначала фильтруем mock-точки
	let filtered = isMockAllowed ? locations : locations.filter((loc) => !loc.mocked)

	if (!keepLast) {
		// Убираем дубликаты по timestamp, оставляя первую встреченную точку
		const seen = new Set<number>()
		filtered = filtered.filter((loc) => {
			if (seen.has(loc.timestamp)) return false
			seen.add(loc.timestamp)
			return true
		})
	} else {
		// Убираем дубликаты по timestamp, оставляя последнюю точку
		const map = new Map<number, LocationObject>()
		for (const loc of filtered) {
			map.set(loc.timestamp, loc)
		}
		filtered = Array.from(map.values())
	}

	return filtered
}
