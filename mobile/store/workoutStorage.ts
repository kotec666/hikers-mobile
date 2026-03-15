import { createMMKV } from 'react-native-mmkv'
import { LocationObject } from 'expo-location'
import { TrainingType } from '@shared/enums'
import {
	deserializeGetterType,
	deserializeLocations,
	POINT_BYTE_SIZE,
	serializeLocation
} from '@/helpers/binarySerializer'

export const workoutStorage = createMMKV({
	id: 'workout-storage'
})

// --- KEY FACTORY (user scoped) ---

const KEY_NOT_SAVED = (userId: string) => `NOT_SAVED_${userId}`
const KEY_SHORT_WORKOUTS = (userId: string) => `SHORT_WORKOUTS_${userId}`
const KEY_ACTIVE_META = (userId: string) => `ACTIVE_META_${userId}`
const KEY_ACTIVE_BIN = (userId: string, chunkIndex: number) => `BIN_${userId}_${chunkIndex}`

export const CHUNK_POINT_COUNT = 200

// --- TYPES ---

export interface IWorkout {
	id: string | null
	userId: string
	isPaused: boolean
	type: TrainingType
	startedAt: number
	totalPausedMs: number
	lastPauseAt: null | number
	locations: IWorkoutLocationStorageItem[]
}

export interface IWorkoutMeta {
	id: string | null
	userId: string
	isPaused: boolean
	type: TrainingType
	startedAt: number
	totalPausedMs: number
	lastPauseAt: null | number
	chunkCount: number
	nextPointId: number
}

export interface IWorkoutLocationStorageItem {
	pointId: number
	relTs: number
	locationObject: LocationObject
	paused: boolean
	isSavedToServer: boolean
}

// --- META ---

export const getWorkoutMeta = (userId?: string): IWorkoutMeta | null | void => {
	if (!userId) return console.error('getWorkoutMeta [error]: no userId provided')
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META(userId))
	return metaStr ? (JSON.parse(metaStr) as IWorkoutMeta) : null
}

// --- ACTIVE WORKOUT ---

export const startAndStoreNewActiveWorkout = (
	type: TrainingType,
	createdTrainingId: string | null,
	userId?: string
) => {
	if (!userId) return console.error('startAndStoreNewActiveWorkout [error]: no userId provided')
	clearActiveWorkoutData(userId)

	const meta: IWorkoutMeta = {
		id: createdTrainingId,
		userId,
		type,
		startedAt: Date.now(),
		isPaused: false,
		totalPausedMs: 0,
		lastPauseAt: null,
		chunkCount: 1,
		nextPointId: 0
	}

	workoutStorage.set(KEY_ACTIVE_META(userId), JSON.stringify(meta))
}

export const clearActiveWorkoutData = (userId?: string) => {
	if (!userId) return console.error('clearActiveWorkoutData [error]: no userId provided')
	const meta = getWorkoutMeta(userId)

	if (meta) {
		for (let i = 0; i < meta.chunkCount + 2; i++) {
			workoutStorage.remove(KEY_ACTIVE_BIN(userId, i))
		}
	}

	workoutStorage.remove(KEY_ACTIVE_META(userId))
}

// --- LOCATION STORAGE ---

const appendBytes = (oldBuffer: Uint8Array | undefined, newBytes: Uint8Array): Uint8Array => {
	if (!oldBuffer) return newBytes
	const tmp = new Uint8Array(oldBuffer.byteLength + newBytes.byteLength)
	tmp.set(oldBuffer)
	tmp.set(newBytes, oldBuffer.byteLength)
	return tmp
}

export const setWorkoutItems = (items: LocationObject[], userId?: string): IWorkoutLocationStorageItem[] => {
	if (!userId) {
		console.error('setWorkoutItems [error]: no userId provided')
		return []
	}
	const meta = getWorkoutMeta(userId)
	if (!meta) return []

	let chunkIdx = Math.max(0, meta.chunkCount - 1)
	let buffer = workoutStorage.getBuffer(KEY_ACTIVE_BIN(userId, chunkIdx))
	let currentBuffer = buffer ? new Uint8Array(buffer as any) : undefined

	const saved: IWorkoutLocationStorageItem[] = []

	for (const item of items) {
		if (item.timestamp < meta.startedAt) continue

		const entry: IWorkoutLocationStorageItem = {
			pointId: meta.nextPointId++,
			relTs: item.timestamp - meta.startedAt,
			locationObject: item,
			paused: meta.isPaused,
			isSavedToServer: false
		}

		saved.push(entry)

		const bytes = serializeLocation(entry)
		const limit = CHUNK_POINT_COUNT * POINT_BYTE_SIZE

		if ((currentBuffer?.byteLength ?? 0) + bytes.byteLength > limit) {
			if (currentBuffer) {
				workoutStorage.set(KEY_ACTIVE_BIN(userId, chunkIdx), currentBuffer.buffer)
			}
			chunkIdx++
			meta.chunkCount = chunkIdx + 1
			currentBuffer = undefined
		}

		currentBuffer = appendBytes(currentBuffer, bytes)
	}

	if (currentBuffer) {
		workoutStorage.set(KEY_ACTIVE_BIN(userId, chunkIdx), currentBuffer.buffer)
	}

	workoutStorage.set(KEY_ACTIVE_META(userId), JSON.stringify(meta))

	return saved
}

// --- ACTIVE -> FULL WORKOUT ---

export const getFullActiveWorkout = (userId?: string): IWorkout | null => {
	if (!userId) {
		console.error('getFullActiveWorkout [error]: no userId provided')
		return null
	}
	const meta = getWorkoutMeta(userId)
	if (!meta) return null

	let locations: IWorkoutLocationStorageItem[] = []

	for (let i = 0; i < meta.chunkCount; i++) {
		const buffer = workoutStorage.getBuffer(KEY_ACTIVE_BIN(userId, i))
		if (!buffer) continue

		const points = deserializeLocations(new Uint8Array(buffer), meta.startedAt, deserializeGetterType.ALL)

		locations = locations.concat(points)
	}

	return {
		id: meta.id,
		userId: meta.userId,
		type: meta.type,
		startedAt: meta.startedAt,
		isPaused: meta.isPaused,
		totalPausedMs: meta.totalPausedMs,
		lastPauseAt: meta.lastPauseAt,
		locations
	}
}

// --- NOT SAVED ---

export const moveActiveWorkoutToNotSaved = (userId?: string) => {
	if (!userId) return console.error('moveActiveWorkoutToNotSaved [error]: no userId provided')
	const workout = getFullActiveWorkout(userId)
	if (!workout) return

	const key = KEY_NOT_SAVED(userId)
	const existing = workoutStorage.getString(key)
	const arr = existing ? (JSON.parse(existing) as IWorkout[]) : []

	workoutStorage.set(key, JSON.stringify([...arr, workout]))

	clearActiveWorkoutData(userId)
}

export const getNotSavedWorkouts = (userId?: string): IWorkout[] => {
	if (!userId) {
		console.error('getNotSavedWorkouts [error]: no userId provided')
		return []
	}
	const str = workoutStorage.getString(KEY_NOT_SAVED(userId))
	return str ? (JSON.parse(str) as IWorkout[]) : []
}

export const getUnsavedWorkoutsThatHaveId = (userId?: string) => {
	const workouts = getNotSavedWorkouts(userId)
	return workouts.filter((workout) => workout.id !== null)
}

// --- SHORT WORKOUTS ---

export const moveActiveWorkoutToShortWorkouts = (userId?: string) => {
	if (!userId) return console.error('moveActiveWorkoutToShortWorkouts [error]: no userId provided')
	const workout = getFullActiveWorkout(userId)
	if (!workout) return

	const key = KEY_SHORT_WORKOUTS(userId)
	const existing = workoutStorage.getString(key)
	const arr = existing ? (JSON.parse(existing) as IWorkout[]) : []

	workoutStorage.set(key, JSON.stringify([...arr, workout]))

	clearActiveWorkoutData(userId)
}

export const getShortWorkouts = (userId?: string): IWorkout[] => {
	if (!userId) {
		console.error('getShortWorkouts [error]: no userId provided')
		return []
	}
	const str = workoutStorage.getString(KEY_SHORT_WORKOUTS(userId))
	return str ? (JSON.parse(str) as IWorkout[]) : []
}

export const setActiveWorkoutPauseState = (isPaused: boolean, userId?: string): void => {
	if (!userId) return console.error('setActiveWorkoutPauseState [error]: no userId provided')

	const meta = getWorkoutMeta(userId)
	if (!meta) return

	let totalPausedMs = meta.totalPausedMs

	if (!isPaused && meta.isPaused && meta.lastPauseAt) {
		totalPausedMs += Date.now() - meta.lastPauseAt
	}

	const updated: IWorkoutMeta = {
		...meta,
		isPaused,
		totalPausedMs,
		lastPauseAt: isPaused ? Date.now() : null
	}

	workoutStorage.set(KEY_ACTIVE_META(userId), JSON.stringify(updated))
}

export const getActiveWorkoutPoints = (
	getterType: deserializeGetterType,
	userId?: string
): IWorkoutLocationStorageItem[] => {
	if (!userId) {
		console.error('getActiveWorkoutPoints [error]: no userId provided')
		return []
	}
	const meta = getWorkoutMeta(userId)
	if (!meta) return []

	const result: IWorkoutLocationStorageItem[] = []

	for (let i = 0; i < meta.chunkCount; i++) {
		const buffer = workoutStorage.getBuffer(KEY_ACTIVE_BIN(userId, i))
		if (!buffer) continue

		const points = deserializeLocations(new Uint8Array(buffer), meta.startedAt, getterType)

		result.push(...points)
	}

	return result
}

export const removeAllShortWorkouts = (userId?: string): void => {
	if (!userId) return console.error('removeAllShortWorkouts [error]: no userId provided')
	workoutStorage.remove(KEY_SHORT_WORKOUTS(userId))
}

export const assignIdToActiveWorkout = (id: string, userId?: string): void => {
	if (!userId) return console.error('assignIdToActiveWorkout [error]: no userId provided')

	const meta = getWorkoutMeta(userId)
	if (!meta) {
		console.warn('[workoutStorage] no active workout to assign id')
		return
	}

	// обновляем id в мета
	const updated: IWorkoutMeta = {
		...meta,
		id
	}

	workoutStorage.set(KEY_ACTIVE_META(userId), JSON.stringify(updated))
}

export const assignIdToAnUnsavedWorkout = (startedAt: number, id: string, userId?: string): void => {
	if (!userId) return console.error('assignIdToAnUnsavedWorkout [error]: no userId provided')
	const key = KEY_NOT_SAVED(userId)
	const str = workoutStorage.getString(key)
	if (!str) return

	let workouts: IWorkout[]
	try {
		workouts = JSON.parse(str)
	} catch (e) {
		console.error('[workoutStorage] parse error:', e)
		return
	}

	let updated = false

	const next = workouts.map((w) => {
		if (w.startedAt === startedAt) {
			updated = true
			return { ...w, id }
		}
		return w
	})

	if (!updated) {
		console.warn('[workoutStorage] workout not found:', startedAt)
		return
	}

	workoutStorage.set(key, JSON.stringify(next))
}

export const deleteUnsavedTrainingByStartedAt = (startedAt: number, userId?: string): void => {
	if (!userId) return console.error('deleteUnsavedTrainingByStartedAt [error]: no userId provided')
	const key = KEY_NOT_SAVED(userId)
	const str = workoutStorage.getString(key)
	if (!str) return

	let workouts: IWorkout[]
	try {
		workouts = JSON.parse(str)
	} catch (e) {
		console.error('[workoutStorage] parse error:', e)
		return
	}

	const filtered = workouts.filter((w) => w.startedAt !== startedAt)

	if (filtered.length === workouts.length) {
		console.warn('[workoutStorage] not found:', startedAt)
		return
	}

	if (filtered.length === 0) {
		workoutStorage.remove(key)
	} else {
		workoutStorage.set(key, JSON.stringify(filtered))
	}
}

export const getUnsavedWorkoutByStartedAt = (startedAt: number, userId?: string): IWorkout | null => {
	if (!userId) {
		console.error('getUnsavedWorkoutByStartedAt [error]: no userId provided')
		return null
	}
	const workouts = getNotSavedWorkouts(userId)
	return workouts.find((w) => w.startedAt === startedAt) ?? null
}

export const markUnsavedWorkoutPointsAsSaved = (startedAt: number, pointIds: number[], userId?: string): void => {
	if (!userId) return console.error('markUnsavedWorkoutPointsAsSaved [error]: no userId provided')

	if (pointIds.length === 0) return

	const key = KEY_NOT_SAVED(userId)
	const str = workoutStorage.getString(key)
	if (!str) return

	let workouts: IWorkout[]
	try {
		workouts = JSON.parse(str)
	} catch (e) {
		console.error('[workoutStorage] parse error:', e)
		return
	}

	const idSet = new Set(pointIds)
	let updated = false

	const next = workouts.map((workout) => {
		if (workout.startedAt !== startedAt) return workout

		let changed = false

		const locations = workout.locations.map((p) => {
			if (!p.isSavedToServer && idSet.has(p.pointId)) {
				changed = true
				return { ...p, isSavedToServer: true }
			}
			return p
		})

		if (!changed) return workout

		updated = true

		return {
			...workout,
			locations
		}
	})

	if (!updated) {
		console.warn('[workoutStorage] no points updated:', startedAt)
		return
	}

	workoutStorage.set(key, JSON.stringify(next))
}

export const getWorkoutChunk = (
	chunkIndex: number,
	startedAt: number,
	userId?: string
): IWorkoutLocationStorageItem[] => {
	if (!userId) {
		console.error('getWorkoutChunk [error]: no userId provided')
		return []
	}
	const buffer = workoutStorage.getBuffer(KEY_ACTIVE_BIN(userId, chunkIndex))

	if (!buffer) return []

	return deserializeLocations(new Uint8Array(buffer), startedAt, deserializeGetterType.ALL)
}

export const markPointsAsSaved = (pointIds: number[], userId?: string) => {
	if (!userId) return console.error('markPointsAsSaved [error]: no userId provided')
	if (pointIds.length === 0) return

	const meta = getWorkoutMeta(userId)
	if (!meta) return

	const idSet = new Set(pointIds)
	const minId = Math.min(...pointIds)
	const maxId = Math.max(...pointIds)

	for (let chunkIndex = 0; chunkIndex < meta.chunkCount; chunkIndex++) {
		const key = KEY_ACTIVE_BIN(userId, chunkIndex)
		const buffer = workoutStorage.getBuffer(key)
		if (!buffer) continue

		const view = new DataView(buffer)
		const pointCount = Math.floor(buffer.byteLength / POINT_BYTE_SIZE)

		let mutated = false

		for (let i = 0; i < pointCount; i++) {
			const baseOffset = i * POINT_BYTE_SIZE
			const pointId = view.getUint32(baseOffset)

			if (pointId < minId || pointId > maxId || !idSet.has(pointId)) {
				continue
			}

			const flagsOffset = baseOffset + 32
			const flags = view.getUint8(flagsOffset)

			// bit1 = saved
			if ((flags & 2) === 0) {
				view.setUint8(flagsOffset, flags | 2)
				mutated = true
			}
		}

		if (mutated) {
			workoutStorage.set(key, buffer)
		}
	}
}

// --- CLEANUP ---

export const removeAllWorkoutStorage = () => {
	workoutStorage.clearAll()
}
