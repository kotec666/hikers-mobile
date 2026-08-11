import { createMMKV } from 'react-native-mmkv'
import { LocationObject } from 'expo-location'
import { TrainingType } from '@shared/enums'
import {
	CHUNK_HEADER_BYTE_SIZE,
	createEmptyChunkBuffer,
	deserializeChunkPoints,
	deserializeGetterType,
	ensureChunkHeader,
	getChunkPointCount,
	getChunkPointsDataView,
	POINT_BYTE_SIZE,
	serializeChunkPoints,
	serializeLocation
} from '@/helpers/binarySerializer'
import { calculateDistanceBetweenWorkoutPoints } from '@/helpers/distance'
import type {
	IStoredWorkoutEntry,
	IWorkout,
	IWorkoutLocationStorageItem,
	IWorkoutMeta
} from '@/store/workoutStorageTypes'
import { runWorkoutStorageMigrations, safeParse } from '@/store/workoutVersioning'

export const workoutStorage = createMMKV({
	id: 'workout-storage'
})

export type { IWorkout, IWorkoutMeta, IWorkoutLocationStorageItem } from '@/store/workoutStorageTypes'

// Применяем миграции при первом импорте модуля (до любого чтения).
runWorkoutStorageMigrations(workoutStorage)

// --- KEY FACTORY (user scoped) ---

const KEY_NOT_SAVED = (userId: string) => `NOT_SAVED_${userId}`
const KEY_SHORT_WORKOUTS = (userId: string) => `SHORT_WORKOUTS_${userId}`
const KEY_ACTIVE_META = (userId: string) => `ACTIVE_META_${userId}`
const KEY_ACTIVE_BIN = (userId: string, chunkIndex: number) => `BIN_${userId}_${chunkIndex}`
const KEY_UNSAVED_BIN = (userId: string, startedAt: number) => `NS_BIN_${userId}_${startedAt}`
const KEY_SHORT_BIN = (userId: string, startedAt: number) => `SHORT_BIN_${userId}_${startedAt}`

export const CHUNK_POINT_COUNT = 200

// --- INTERNAL HELPERS ---

const CHUNK_BYTE_LIMIT = CHUNK_POINT_COUNT * POINT_BYTE_SIZE + CHUNK_HEADER_BYTE_SIZE

const readWorkoutEntries = (key: string): IStoredWorkoutEntry[] => safeParse(workoutStorage.getString(key), [])

const writeWorkoutEntries = (key: string, entries: IStoredWorkoutEntry[]): void => {
	if (entries.length === 0) {
		workoutStorage.remove(key)
		return
	}
	workoutStorage.set(key, JSON.stringify(entries))
}

const materializeWorkout = (entry: IStoredWorkoutEntry, blobKey: string): IWorkout => {
	const buffer = workoutStorage.getBuffer(blobKey)
	const locations = buffer ? deserializeChunkPoints(buffer, entry.startedAt, deserializeGetterType.ALL) : []
	return { ...entry, locations }
}

const addWorkoutDistancePointToMeta = (meta: IWorkoutMeta, entry: IWorkoutLocationStorageItem): void => {
	if (entry.paused) {
		meta.lastDistancePoint = null
		return
	}

	if (meta.lastDistancePoint) {
		meta.distanceMeters += calculateDistanceBetweenWorkoutPoints(meta.lastDistancePoint, entry)
	}

	meta.lastDistancePoint = entry
}

// Выставляет бит «saved» точкам из idSet в буфере чанка. Возвращает был ли мутирован буфер.
const setPointFlagsSavedInBuffer = (
	buffer: ArrayBufferLike,
	idSet: Set<number>,
	minId: number,
	maxId: number
): boolean => {
	const view = getChunkPointsDataView(buffer)
	let mutated = false

	for (let i = 0; i < getChunkPointCount(buffer); i++) {
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

	return mutated
}

const appendBytes = (oldBuffer: Uint8Array, newBytes: Uint8Array) => {
	const tmp = new Uint8Array(oldBuffer.byteLength + newBytes.byteLength)
	tmp.set(oldBuffer)
	tmp.set(newBytes, oldBuffer.byteLength)
	return tmp
}

// --- CLEANUP ---
export const removeUserWorkoutStorage = (userId?: string): void => {
	if (!userId) {
		console.error('removeUserWorkoutStorage [error]: no userId provided')
		return
	}

	try {
		const keys = workoutStorage.getAllKeys()

		// Префиксы, которые относятся к пользователю
		const prefixes = [
			`NOT_SAVED_${userId}`,
			`SHORT_WORKOUTS_${userId}`,
			`ACTIVE_META_${userId}`,
			`BIN_${userId}_`,
			`NS_BIN_${userId}_`,
			`SHORT_BIN_${userId}_`
		]

		for (const key of keys) {
			const shouldDelete = prefixes.some((prefix) => key.startsWith(prefix))

			if (shouldDelete) {
				workoutStorage.remove(key)
			}
		}
	} catch (e) {
		console.error('[removeUserWorkoutStorage] error:', e)
	}
}

// --- META ---

export const getWorkoutMeta = (userId?: string): IWorkoutMeta | null | void => {
	if (!userId) return console.error('getWorkoutMeta [error]: no userId provided')
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META(userId))
	if (!metaStr) return null

	return safeParse<IWorkoutMeta | null>(metaStr, null)
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
		nextPointId: 0,
		distanceMeters: 0,
		lastDistancePoint: null
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

export const setWorkoutItems = (items: LocationObject[], userId?: string): IWorkoutLocationStorageItem[] => {
	if (!userId) {
		console.error('setWorkoutItems [error]: no userId provided')
		return []
	}
	const meta = getWorkoutMeta(userId)
	if (!meta) return []

	let chunkIdx = Math.max(0, meta.chunkCount - 1)
	const existing = workoutStorage.getBuffer(KEY_ACTIVE_BIN(userId, chunkIdx))
	let currentBuffer = existing
		? new Uint8Array(ensureChunkHeader(existing))
		: new Uint8Array(createEmptyChunkBuffer())

	const saved: IWorkoutLocationStorageItem[] = []

	for (const item of items) {
		const normalizedTimestamp = Math.trunc(item.timestamp)
		if (normalizedTimestamp < meta.startedAt) continue

		const entry: IWorkoutLocationStorageItem = {
			pointId: meta.nextPointId++,
			relTs: normalizedTimestamp - meta.startedAt,
			locationObject: { ...item, timestamp: normalizedTimestamp },
			paused: meta.isPaused,
			isSavedToServer: false
		}

		saved.push(entry)
		addWorkoutDistancePointToMeta(meta, entry)

		const bytes = serializeLocation(entry)

		if (currentBuffer.byteLength + bytes.byteLength > CHUNK_BYTE_LIMIT) {
			workoutStorage.set(KEY_ACTIVE_BIN(userId, chunkIdx), currentBuffer.buffer)
			chunkIdx++
			meta.chunkCount = chunkIdx + 1
			currentBuffer = new Uint8Array(createEmptyChunkBuffer())
		}

		currentBuffer = appendBytes(currentBuffer, bytes)
	}

	if (currentBuffer.byteLength > CHUNK_HEADER_BYTE_SIZE) {
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

		const points = deserializeChunkPoints(buffer, meta.startedAt, deserializeGetterType.ALL)

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
		distanceMeters: meta.distanceMeters,
		locations
	}
}

// --- NOT SAVED ---

export const moveActiveWorkoutToNotSaved = (userId?: string) => {
	if (!userId) return console.error('moveActiveWorkoutToNotSaved [error]: no userId provided')
	const workout = getFullActiveWorkout(userId)
	if (!workout) return

	const { locations, ...entry } = workout

	const key = KEY_NOT_SAVED(userId)
	const entries = readWorkoutEntries(key)
	entries.push(entry)
	writeWorkoutEntries(key, entries)

	workoutStorage.set(KEY_UNSAVED_BIN(userId, workout.startedAt), serializeChunkPoints(locations))

	clearActiveWorkoutData(userId)
}

export const getNotSavedWorkouts = (userId?: string): IWorkout[] => {
	if (!userId) {
		console.error('getNotSavedWorkouts [error]: no userId provided')
		return []
	}

	const entries = readWorkoutEntries(KEY_NOT_SAVED(userId))

	return entries.map((entry) => materializeWorkout(entry, KEY_UNSAVED_BIN(userId, entry.startedAt)))
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

	const { locations, ...entry } = workout

	const key = KEY_SHORT_WORKOUTS(userId)
	const entries = readWorkoutEntries(key)
	entries.push(entry)
	writeWorkoutEntries(key, entries)

	workoutStorage.set(KEY_SHORT_BIN(userId, workout.startedAt), serializeChunkPoints(locations))

	clearActiveWorkoutData(userId)
}

export const getShortWorkouts = (userId?: string): IWorkout[] => {
	if (!userId) {
		console.error('getShortWorkouts [error]: no userId provided')
		return []
	}

	const entries = readWorkoutEntries(KEY_SHORT_WORKOUTS(userId))

	return entries.map((entry) => materializeWorkout(entry, KEY_SHORT_BIN(userId, entry.startedAt)))
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

		const points = deserializeChunkPoints(buffer, meta.startedAt, getterType)

		result.push(...points)
	}

	return result
}

export const getLastActiveWorkoutPoint = (userId?: string): IWorkoutLocationStorageItem | null => {
	if (!userId) return null

	const meta = getWorkoutMeta(userId)
	if (!meta) return null

	for (let i = meta.chunkCount - 1; i >= 0; i--) {
		const buffer = workoutStorage.getBuffer(KEY_ACTIVE_BIN(userId, i))
		if (!buffer) continue

		const points = deserializeChunkPoints(buffer, meta.startedAt, deserializeGetterType.ALL)
		const lastPoint = points.at(-1)

		if (lastPoint) return lastPoint
	}

	return null
}

export const getWorkoutDistanceMeters = (userId?: string): number => {
	if (!userId) return 0

	const meta = getWorkoutMeta(userId)
	if (!meta) return 0

	return Math.max(0, meta.distanceMeters)
}

export const removeAllShortWorkouts = (userId?: string): void => {
	if (!userId) return console.error('removeAllShortWorkouts [error]: no userId provided')

	const prefix = `SHORT_BIN_${userId}_`

	for (const key of workoutStorage.getAllKeys()) {
		if (key.startsWith(prefix)) {
			workoutStorage.remove(key)
		}
	}

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
	const entries = readWorkoutEntries(key)

	let updated = false

	const next = entries.map((w) => {
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

	writeWorkoutEntries(key, next)
}

export const deleteUnsavedTrainingByStartedAt = (startedAt: number, userId?: string): void => {
	if (!userId) return console.error('deleteUnsavedTrainingByStartedAt [error]: no userId provided')
	const key = KEY_NOT_SAVED(userId)
	const entries = readWorkoutEntries(key)

	const filtered = entries.filter((w) => w.startedAt !== startedAt)

	if (filtered.length === entries.length) {
		console.warn('[workoutStorage] not found:', startedAt)
		return
	}

	workoutStorage.remove(KEY_UNSAVED_BIN(userId, startedAt))
	writeWorkoutEntries(key, filtered)
}

export const getUnsavedWorkoutByStartedAt = (startedAt: number, userId?: string): IWorkout | null => {
	if (!userId) {
		console.error('getUnsavedWorkoutByStartedAt [error]: no userId provided')
		return null
	}

	const entry = readWorkoutEntries(KEY_NOT_SAVED(userId)).find((w) => w.startedAt === startedAt)

	return entry ? materializeWorkout(entry, KEY_UNSAVED_BIN(userId, entry.startedAt)) : null
}

export const markUnsavedWorkoutPointsAsSaved = (startedAt: number, pointIds: number[], userId?: string): void => {
	if (!userId) return console.error('markUnsavedWorkoutPointsAsSaved [error]: no userId provided')

	if (pointIds.length === 0) return

	const key = KEY_UNSAVED_BIN(userId, startedAt)
	const buffer = workoutStorage.getBuffer(key)
	if (!buffer) {
		console.warn('[workoutStorage] unsaved workout blob not found:', startedAt)
		return
	}

	const mutated = setPointFlagsSavedInBuffer(buffer, new Set(pointIds), Math.min(...pointIds), Math.max(...pointIds))

	if (mutated) {
		workoutStorage.set(key, buffer)
	}
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

	return deserializeChunkPoints(buffer, startedAt, deserializeGetterType.ALL)
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

		if (setPointFlagsSavedInBuffer(buffer, idSet, minId, maxId)) {
			workoutStorage.set(key, buffer)
		}
	}
}

// --- CLEANUP ---
// export const removeAllWorkoutStorage = () => {
// 	workoutStorage.clearAll()
// }
