import { DeadReckoningEngine } from '@/helpers/location/DeadReckoningEngine'
import { Accelerometer } from 'expo-sensors'

export function startPdrSensors(
	engine: DeadReckoningEngine,
	onStepRegistered?: (
		geo: {
			latitude: number
			longitude: number
			altitude: number
		},
		orientationAngle: number
	) => void
) {
	Accelerometer.setUpdateInterval(100)

	const accSub = Accelerometer.addListener((acc) => {
		engine.updateSensors(
			{ x: acc.x, y: acc.y, z: acc.z },
			{ alpha: 0, beta: 0, gamma: 0 },
			{ x: 0, y: 0, z: 0 },
			1013.25
		)
		const stepDetected = engine.updateRealTimePosition()
		if (!stepDetected) return

		const geo = engine.getGeoPosition()
		if (!geo) return

		onStepRegistered?.(geo, engine.getState().orientationAngle)
		// const item = {
		// 	coords: {
		// 		latitude: geo.latitude,
		// 		longitude: geo.longitude,
		// 		altitude: geo.altitude,
		// 		heading: engine.getState().orientationAngle
		// 	},
		// 	timestamp: Date.now()
		// }
	})

	return () => accSub.remove()
}
