import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { mpsToKmph } from '@/helpers/mpsToKmph'

export const prepareLocationsForSync = (locations: IWorkoutLocationStorageItem[]) => {
	return locations.map((item) => ({
		pointId: item.pointId,
		relTs: item.relTs,
		alt: item.locationObject.coords.altitude || 0,
		speed_kmh: mpsToKmph(item.locationObject.coords.speed || 0),
		paused: item.paused,
		lat: item.locationObject.coords.latitude,
		lng: item.locationObject.coords.longitude,
		locationObject: {
			coords: item.locationObject.coords,
			timestamp: item.locationObject.timestamp
		}
	}))
}
