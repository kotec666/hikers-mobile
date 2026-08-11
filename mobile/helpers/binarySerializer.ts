import { LocationObject } from 'expo-location'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorageTypes'

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

// ============================================================
// Версия бинарного формата чанков.
// Любое изменение структуры точки (офсеты, типы полей, размер) = бамп CHUNK_VERSION
// + ветвление в deserializeChunkPoints для чтения старых форматов.
// ============================================================

export const CHUNK_MAGIC = 0x4b505754 // 'WKPT'
export const CHUNK_VERSION = 1
export const CHUNK_HEADER_BYTE_SIZE = 5 // magic(4) + version(1)

export const hasChunkHeader = (buffer: ArrayBufferLike): boolean =>
	buffer.byteLength >= CHUNK_HEADER_BYTE_SIZE && new DataView(buffer).getUint32(0) === CHUNK_MAGIC

// Точки только-данных без заголовка (пустая область точек = длина 0).
const getPointsRegion = (buffer: ArrayBufferLike): { byteOffset: number; byteLength: number } => {
	const byteOffset = hasChunkHeader(buffer) ? CHUNK_HEADER_BYTE_SIZE : 0
	return { byteOffset, byteLength: buffer.byteLength - byteOffset }
}

export const getChunkPointCount = (buffer: ArrayBufferLike): number => {
	const { byteLength } = getPointsRegion(buffer)
	return Math.floor(byteLength / POINT_BYTE_SIZE)
}

// DataView над областью точек (без заголовка). Мутации идут в общий буфер чанка.
export const getChunkPointsDataView = (buffer: ArrayBufferLike): DataView => {
	const { byteOffset, byteLength } = getPointsRegion(buffer)
	return new DataView(buffer, byteOffset, byteLength)
}

// Гарантирует наличие заголовка у буфера: legacy-чанки (без заголовка) оборачиваются.
export const ensureChunkHeader = (buffer: ArrayBufferLike): ArrayBuffer => {
	if (hasChunkHeader(buffer)) return buffer as ArrayBuffer

	const out = new ArrayBuffer(CHUNK_HEADER_BYTE_SIZE + buffer.byteLength)
	const view = new DataView(out)
	view.setUint32(0, CHUNK_MAGIC)
	view.setUint8(4, CHUNK_VERSION)
	new Uint8Array(out).set(new Uint8Array(buffer), CHUNK_HEADER_BYTE_SIZE)
	return out
}

// Создаёт пустой чанк (только заголовок) — точка отсчёта для инкрементальной записи.
export const createEmptyChunkBuffer = (): ArrayBuffer => {
	const out = new ArrayBuffer(CHUNK_HEADER_BYTE_SIZE)
	const view = new DataView(out)
	view.setUint32(0, CHUNK_MAGIC)
	view.setUint8(4, CHUNK_VERSION)
	return out
}

export const serializeChunkPoints = (items: IWorkoutLocationStorageItem[]): ArrayBuffer => {
	const out = new ArrayBuffer(CHUNK_HEADER_BYTE_SIZE + items.length * POINT_BYTE_SIZE)
	const view = new DataView(out)
	view.setUint32(0, CHUNK_MAGIC)
	view.setUint8(4, CHUNK_VERSION)

	for (let i = 0; i < items.length; i++) {
		new Uint8Array(out).set(serializeLocation(items[i]), CHUNK_HEADER_BYTE_SIZE + i * POINT_BYTE_SIZE)
	}

	return out
}

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

// Читает чанк с заголовком (или legacy-чанк без заголовка) в точки.
export const deserializeChunkPoints = (
	buffer: ArrayBufferLike | undefined,
	startedAt: number,
	getterType: deserializeGetterType
): IWorkoutLocationStorageItem[] => {
	if (!buffer || buffer.byteLength === 0) return []

	const { byteOffset, byteLength } = getPointsRegion(buffer)

	return deserializeLocations(new Uint8Array(buffer, byteOffset, byteLength), startedAt, getterType)
}
