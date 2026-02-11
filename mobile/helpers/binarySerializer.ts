import { LocationObject } from 'expo-location'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'

/**
 *
 * struct Point29 {
 *     uint32 pointId;     // 4 	max ~4.2 млрд точек
 *     float32 lat;        // 4
 *     float32 lon;        // 4
 *     float32 altitude;   // 4
 *     float32 accuracy;   // 4
 *     float32 speed;      // 4
 *     float32 heading;    // 4
 *     uint32 relTs;       // 4		UInt32 max = 4 294 967 295 ms ≈ 49.7 дней
 *     uint8 flags;        // 1		(bit0 = paused, bit1 = saved)
 * }
 *
 */

// Размер одной точки в байтах
// pointId(4) + Lat(4) + Lon(4) + Alt(4) + Acc(4) + Speed(4) + Heading(4) + relTs(4) + Flags(1) = 33 байта
export const POINT_BYTE_SIZE = 33

export const serializeLocation = (item: IWorkoutLocationStorageItem): Uint8Array => {
	const buffer = new ArrayBuffer(POINT_BYTE_SIZE)
	const view = new DataView(buffer)

	const { locationObject, relTs, paused, isSavedToServer, pointId } = item
	const { coords } = locationObject

	let offset = 0

	view.setUint32(offset, pointId)
	offset += 4

	view.setFloat32(offset, coords.latitude)
	offset += 4

	view.setFloat32(offset, coords.longitude)
	offset += 4

	view.setFloat32(offset, coords.altitude ?? 0)
	offset += 4

	view.setFloat32(offset, coords.accuracy ?? 0)
	offset += 4

	view.setFloat32(offset, coords.speed ?? 0)
	offset += 4

	view.setFloat32(offset, coords.heading ?? 0)
	offset += 4

	// relTs (uint32)
	view.setUint32(offset, relTs)
	offset += 4

	// flags (bit0 = paused, bit1 = saved)
	let flags = 0
	if (paused) flags |= 1
	if (isSavedToServer) flags |= 2
	view.setUint8(offset, flags)

	return new Uint8Array(buffer)
}

// export const serializeLocations = (items: IWorkoutLocationStorageItem[]): ArrayBuffer => {
// 	const buffer = new ArrayBuffer(items.length * POINT_BYTE_SIZE)
// 	const target = new Uint8Array(buffer)
//
// 	for (let i = 0; i < items.length; i++) {
// 		target.set(serializeLocation(items[i]), i * POINT_BYTE_SIZE)
// 	}
//
// 	return buffer
// }

export enum deserializeGetterType {
	ALL = 'all',
	NOT_SAVED = 'notSaved'
}

export const deserializeLocations = (
	buffer: Uint8Array | undefined,
	startedAt: number,
	getterType: deserializeGetterType
): IWorkoutLocationStorageItem[] => {
	if (!buffer || buffer.byteLength === 0) return []

	const count = Math.floor(buffer.byteLength / POINT_BYTE_SIZE)
	const result: IWorkoutLocationStorageItem[] = []

	const view = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)

	for (let i = 0; i < count; i++) {
		let offset = i * POINT_BYTE_SIZE

		const pointId = view.getUint32(offset)
		offset += 4
		const latitude = view.getFloat32(offset)
		offset += 4
		const longitude = view.getFloat32(offset)
		offset += 4
		const altitude = view.getFloat32(offset)
		offset += 4
		const accuracy = view.getFloat32(offset)
		offset += 4
		const speed = view.getFloat32(offset)
		offset += 4
		const heading = view.getFloat32(offset)
		offset += 4
		const relTs = view.getUint32(offset)
		offset += 4

		const flags = view.getUint8(offset)

		const paused = (flags & 1) !== 0
		const isSavedToServer = (flags & 2) !== 0

		if (getterType === deserializeGetterType.NOT_SAVED) {
			if (isSavedToServer) continue
		}

		const locationObject: LocationObject = {
			coords: {
				latitude,
				longitude,
				altitude: altitude !== 0 ? altitude : null,
				accuracy: accuracy !== 0 ? accuracy : null,
				altitudeAccuracy: null,
				heading: heading !== 0 ? heading : null,
				speed: speed !== 0 ? speed : null
			},
			timestamp: startedAt + relTs, // НЕ храним timestamp → ставим 0 либо если нужно будет, то meta.startedAt + relTs
			mocked: false
		}

		result.push({
			pointId,
			locationObject,
			relTs,
			paused,
			isSavedToServer
		})
	}

	return result
}
