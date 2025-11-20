import { LocationObject } from 'expo-location'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'

// Размер одной точки в байтах
// Lat(8) + Lon(8) + Alt(4) + Acc(4) + Speed(4) + Heading(4) + Ts(8) + RelTs(4) + Flags(1) = 45 байт
export const POINT_BYTE_SIZE = 45

export const serializeLocation = (item: IWorkoutLocationStorageItem): Uint8Array => {
	const buffer = new ArrayBuffer(POINT_BYTE_SIZE)
	const view = new DataView(buffer)

	const { locationObject, relTs, isPausedPoint, isSavedToServer } = item
	const { coords, timestamp } = locationObject

	let offset = 0

	// 1. Latitude (Float64 - 8 bytes)
	view.setFloat64(offset, coords.latitude)
	offset += 8

	// 2. Longitude (Float64 - 8 bytes)
	view.setFloat64(offset, coords.longitude)
	offset += 8

	// 3. Altitude (Float32 - 4 bytes) - храним 0 если null
	view.setFloat32(offset, (coords.altitude || 0) as number)
	offset += 4

	// 4. Accuracy (Float32 - 4 bytes)
	view.setFloat32(offset, (coords.accuracy || 0) as number)
	offset += 4

	// 5. Speed (Float32 - 4 bytes)
	view.setFloat32(offset, (coords.speed || 0) as number)
	offset += 4

	// 6. Heading (Float32 - 4 bytes)
	view.setFloat32(offset, (coords.heading || 0) as number)
	offset += 4

	// 7. Timestamp (Float64 - 8 bytes) - оригинальный timestamp
	view.setFloat64(offset, timestamp)
	offset += 8

	// 8. Relative Timestamp (Float32 - 4 bytes)
	view.setFloat32(offset, relTs)
	offset += 4

	// 9. Flags (Uint8 - 1 byte)
	// Bit 0: isPausedPoint
	// Bit 1: isSavedToServer
	let flags = 0
	if (isPausedPoint) flags |= 1 // 00000001
	if (isSavedToServer) flags |= 2 // 00000010
	view.setUint8(offset, flags)

	return new Uint8Array(buffer)
}

export const deserializeLocations = (buffer: Uint8Array | undefined): IWorkoutLocationStorageItem[] => {
	if (!buffer || buffer.byteLength === 0) return []

	const count = Math.floor(buffer.byteLength / POINT_BYTE_SIZE)
	const result: IWorkoutLocationStorageItem[] = []
	// Cast buffer.buffer to ArrayBuffer to satisfy DataView constructor strict types
	const view = new DataView(buffer.buffer as ArrayBuffer, buffer.byteOffset, buffer.byteLength)

	for (let i = 0; i < count; i++) {
		let offset = i * POINT_BYTE_SIZE

		const latitude = view.getFloat64(offset)
		offset += 8

		const longitude = view.getFloat64(offset)
		offset += 8

		const altitude = view.getFloat32(offset)
		offset += 4

		const accuracy = view.getFloat32(offset)
		offset += 4

		const speed = view.getFloat32(offset)
		offset += 4

		const heading = view.getFloat32(offset)
		offset += 4

		const timestamp = view.getFloat64(offset)
		offset += 8

		const relTs = view.getFloat32(offset)
		offset += 4

		const flags = view.getUint8(offset)
		const isPausedPoint = (flags & 1) === 1
		const isSavedToServer = (flags & 2) === 2

		// Восстанавливаем структуру LocationObject
		const locationObject: LocationObject = {
			coords: {
				latitude,
				longitude,
				altitude: altitude !== 0 ? altitude : null,
				accuracy: accuracy !== 0 ? accuracy : null,
				altitudeAccuracy: null, // Мы не храним это для экономии
				heading: heading !== 0 ? heading : null,
				speed: speed !== 0 ? speed : null
			},
			timestamp: timestamp,
			mocked: false // Не храним
		}

		result.push({
			locationObject,
			relTs,
			isPausedPoint,
			isSavedToServer
		})
	}

	return result
}
