import { createMMKV } from 'react-native-mmkv'
import { LocationObject } from 'expo-location'
import { TrainingType } from '@shared/enums'
import { deserializeLocations, POINT_BYTE_SIZE, serializeLocation } from '@/helpers/binarySerializer'

export const workoutStorage = createMMKV({
	id: 'workout-storage'
})

// Keys
const KEY_NOT_SAVED = 'NOT_SAVED_WORKOUTS'
const KEY_ACTIVE_META = 'ACTIVE_WORKOUT_META'
const KEY_ACTIVE_BIN_CHUNK_PREFIX = 'BIN_CHUNK_'

// Размер чанка (количество точек)
const CHUNK_POINT_COUNT = 200

export interface IWorkoutStorage {
	notSavedWorkouts: IWorkout[]
	activeWorkout: IWorkout | null
}

export interface IWorkout {
	isPaused: boolean
	type: TrainingType
	startedAt: number
	totalPausedMs: number
	lastPauseAt: null | number
	locations: IWorkoutLocationStorageItem[]
}

// Внутренняя структура метаданных
interface IWorkoutMeta {
	isPaused: boolean
	type: TrainingType
	startedAt: number
	totalPausedMs: number
	lastPauseAt: null | number
	chunkCount: number
}

export interface IWorkoutLocationStorageItem {
	relTs: number
	locationObject: LocationObject
	isPausedPoint: boolean
	isSavedToServer: boolean
}

export const getWorkoutMeta = (): IWorkoutMeta | null => {
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)
	if (metaStr) {
		return JSON.parse(metaStr) as IWorkoutMeta
	}
	return null
}

/**
 * Helper: Append bytes to a buffer
 */
const appendBytes = (oldBuffer: Uint8Array | undefined, newBytes: Uint8Array): Uint8Array => {
	if (!oldBuffer) return newBytes
	const tmp = new Uint8Array(oldBuffer.byteLength + newBytes.byteLength)
	tmp.set(oldBuffer, 0)
	tmp.set(newBytes, oldBuffer.byteLength)
	return tmp
}

export const setActiveWorkoutPauseState = (isPaused: boolean): void => {
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)

	if (metaStr) {
		const meta = JSON.parse(metaStr) as IWorkoutMeta

		let totalPausedMs = meta.totalPausedMs
		if (!isPaused && meta.isPaused && meta.lastPauseAt) {
			const pausedFor = Date.now() - meta.lastPauseAt
			totalPausedMs += pausedFor
		}

		const updatedMeta: IWorkoutMeta = {
			...meta,
			isPaused: isPaused,
			totalPausedMs: totalPausedMs,
			lastPauseAt: isPaused ? Date.now() : null
		}

		workoutStorage.set(KEY_ACTIVE_META, JSON.stringify(updatedMeta))
	}
}

export const startAndStoreNewActiveWorkout = (type: TrainingType) => {
	clearActiveWorkoutData()

	const newMeta: IWorkoutMeta = {
		type,
		startedAt: Date.now(),
		isPaused: false,
		totalPausedMs: 0,
		lastPauseAt: null,
		chunkCount: 1
	}

	workoutStorage.set(KEY_ACTIVE_META, JSON.stringify(newMeta))
}

export const moveActiveWorkoutToNotSaved = () => {
	const fullActive = getFullActiveWorkout()

	if (fullActive) {
		const notSavedStr = workoutStorage.getString(KEY_NOT_SAVED)
		const notSavedWorkouts = notSavedStr ? (JSON.parse(notSavedStr) as IWorkout[]) : []

		const updatedNotSaved = [...notSavedWorkouts, fullActive]
		workoutStorage.set(KEY_NOT_SAVED, JSON.stringify(updatedNotSaved))

		clearActiveWorkoutData()
	}
}

export const setWorkoutItem = (workoutItem: LocationObject): IWorkoutLocationStorageItem | null => {
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)
	if (!metaStr) {
		// Тренировка не активна
		return null
	}

	const meta = JSON.parse(metaStr) as IWorkoutMeta

	const startedAt = meta.startedAt
	const lastSavedRelTs = workoutItem.timestamp - startedAt

	const workoutItemToSave: IWorkoutLocationStorageItem = {
		locationObject: workoutItem,
		relTs: lastSavedRelTs,
		isSavedToServer: false,
		isPausedPoint: meta.isPaused
	}

	// 1. Serialize
	const newBytes = serializeLocation(workoutItemToSave)

	// 2. Get Current Chunk
	const currentChunkIdx = Math.max(0, meta.chunkCount - 1)
	const chunkKey = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${currentChunkIdx}`

	const rawBuffer = workoutStorage.getBuffer(chunkKey)
	// Ensure we are working with Uint8Array and satisfy Typescript strictness
	const currentBuffer = rawBuffer ? new Uint8Array(rawBuffer as unknown as ArrayLike<number>) : undefined
	const currentSize = currentBuffer ? currentBuffer.byteLength : 0
	const chunkByteLimit = CHUNK_POINT_COUNT * POINT_BYTE_SIZE

	// 3. Append or Create New Chunk
	if (currentSize >= chunkByteLimit) {
		const newChunkIdx = currentChunkIdx + 1
		const newKey = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${newChunkIdx}`

		workoutStorage.set(newKey, newBytes.buffer as ArrayBuffer)

		meta.chunkCount = newChunkIdx + 1
		workoutStorage.set(KEY_ACTIVE_META, JSON.stringify(meta))
	} else {
		const updatedBuffer = appendBytes(currentBuffer, newBytes)
		workoutStorage.set(chunkKey, updatedBuffer.buffer as ArrayBuffer)
	}

	return workoutItemToSave
}

export const setWorkoutItems = (workoutItems: LocationObject[]) => {
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)
	if (!metaStr) return

	const meta = JSON.parse(metaStr) as IWorkoutMeta
	let currentChunkIdx = Math.max(0, meta.chunkCount - 1)
	let chunkKey = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${currentChunkIdx}`

	const rawBuffer = workoutStorage.getBuffer(chunkKey)
	// Explicitly type currentBuffer to avoid narrowing to Uint8Array<ArrayBuffer>
	let currentBuffer: Uint8Array | undefined = rawBuffer
		? new Uint8Array(rawBuffer as unknown as ArrayLike<number>)
		: undefined
	let metaDirty = false

	for (const workoutItem of workoutItems) {
		const lastSavedRelTs = workoutItem.timestamp - meta.startedAt
		const workoutItemToSave = {
			relTs: lastSavedRelTs,
			isSavedToServer: false,
			locationObject: workoutItem,
			isPausedPoint: meta.isPaused
		}

		const newBytes = serializeLocation(workoutItemToSave)
		const currentSize = currentBuffer ? currentBuffer.byteLength : 0
		const chunkByteLimit = CHUNK_POINT_COUNT * POINT_BYTE_SIZE

		if (currentSize >= chunkByteLimit) {
			if (currentBuffer) {
				workoutStorage.set(chunkKey, currentBuffer.buffer as ArrayBuffer)
			}

			currentChunkIdx++
			chunkKey = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${currentChunkIdx}`
			currentBuffer = undefined

			meta.chunkCount = currentChunkIdx + 1
			metaDirty = true
		}

		currentBuffer = appendBytes(currentBuffer, newBytes)
	}

	// Save last buffer state
	if (currentBuffer) {
		workoutStorage.set(chunkKey, currentBuffer.buffer as ArrayBuffer)
	}

	if (metaDirty) {
		workoutStorage.set(KEY_ACTIVE_META, JSON.stringify(meta))
	}
}

export const getAllWorkoutStorage = (): IWorkoutStorage => {
	const notSavedStr = workoutStorage.getString(KEY_NOT_SAVED)
	const notSavedWorkouts = notSavedStr ? (JSON.parse(notSavedStr) as IWorkout[]) : []

	return {
		notSavedWorkouts,
		activeWorkout: getFullActiveWorkout()
	}
}

export const removeAllWorkoutStorage = () => {
	workoutStorage.clearAll()
}

// --- Helpers ---

const clearActiveWorkoutData = () => {
	// Используем getAllKeys() для точечной очистки
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)
	if (metaStr) {
		try {
			const meta = JSON.parse(metaStr) as IWorkoutMeta
			for (let i = 0; i < meta.chunkCount; i++) {
				workoutStorage.remove(`${KEY_ACTIVE_BIN_CHUNK_PREFIX}${i}`)
			}
		} catch (e) {
			console.warn('Failed to parse meta for cleanup', e)
		}
	}

	// На всякий случай подчищаем все ключи чанков
	const keys = workoutStorage.getAllKeys()
	for (const key of keys) {
		if (key.startsWith(KEY_ACTIVE_BIN_CHUNK_PREFIX)) {
			workoutStorage.remove(key)
		}
	}

	workoutStorage.remove(KEY_ACTIVE_META)
}

export const getFullActiveWorkout = (): IWorkout | null => {
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)
	if (!metaStr) return null

	const meta = JSON.parse(metaStr) as IWorkoutMeta
	return getActiveWorkoutFromStorage(meta)
}

export const getLastChunkOfActiveWorkout = (): IWorkout | null => {
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)
	if (!metaStr) return null

	const meta = JSON.parse(metaStr) as IWorkoutMeta

	if (meta.chunkCount === 0) {
		return {
			type: meta.type,
			startedAt: meta.startedAt,
			isPaused: meta.isPaused,
			totalPausedMs: meta.totalPausedMs,
			lastPauseAt: meta.lastPauseAt,
			locations: []
		}
	}

	// Последний индекс чанка
	const lastChunkIdx = meta.chunkCount - 1
	const chunkKey = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${lastChunkIdx}`

	const chunkBuffer = workoutStorage.getBuffer(chunkKey)
	let locations: IWorkoutLocationStorageItem[] = []

	if (chunkBuffer) {
		locations = deserializeLocations(new Uint8Array(chunkBuffer))
	}

	return {
		type: meta.type,
		startedAt: meta.startedAt,
		isPaused: meta.isPaused,
		totalPausedMs: meta.totalPausedMs,
		lastPauseAt: meta.lastPauseAt,
		locations
	}
}

const getActiveWorkoutFromStorage = (meta: IWorkoutMeta): IWorkout => {
	let locations: IWorkoutLocationStorageItem[] = []

	for (let i = 0; i < meta.chunkCount; i++) {
		const chunkBuffer = workoutStorage.getBuffer(`${KEY_ACTIVE_BIN_CHUNK_PREFIX}${i}`)
		if (chunkBuffer) {
			const chunkPoints = deserializeLocations(new Uint8Array(chunkBuffer))
			locations = locations.concat(chunkPoints)
		}
	}

	return {
		type: meta.type,
		startedAt: meta.startedAt,
		isPaused: meta.isPaused,
		totalPausedMs: meta.totalPausedMs,
		lastPauseAt: meta.lastPauseAt,
		locations
	}
}
