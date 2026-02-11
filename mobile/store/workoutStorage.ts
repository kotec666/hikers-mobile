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

// Keys
const KEY_NOT_SAVED = 'NOT_SAVED_WORKOUTS'
const KEY_SHORT_WORKOUTS = 'SHORT_WORKOUTS'
const KEY_ACTIVE_META = 'ACTIVE_WORKOUT_META'
const KEY_ACTIVE_BIN_CHUNK_PREFIX = 'BIN_CHUNK_'

// Размер чанка (количество точек)
export const CHUNK_POINT_COUNT = 200

export interface IWorkoutStorage {
	notSavedWorkouts: IWorkout[]
	shortWorkouts: IWorkout[] // список коротких тренировок, которые нужно удалить, когда появится интернет на устройстве
	activeWorkout: IWorkout | null
}

export interface IWorkout {
	id: string | null
	isPaused: boolean
	type: TrainingType
	startedAt: number
	totalPausedMs: number
	lastPauseAt: null | number
	locations: IWorkoutLocationStorageItem[]
}

// Внутренняя структура метаданных
export interface IWorkoutMeta {
	id: string | null
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

export const getWorkoutMeta = (): IWorkoutMeta | null => {
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)
	if (metaStr) {
		return JSON.parse(metaStr) as IWorkoutMeta
	}
	return null
}

export const deleteUnsavedTrainingByStartedAt = (startedAt: number): void => {
	const notSavedStr = workoutStorage.getString(KEY_NOT_SAVED)
	if (!notSavedStr) return

	let notSavedWorkouts: IWorkout[]
	try {
		notSavedWorkouts = JSON.parse(notSavedStr) as IWorkout[]
	} catch (e) {
		console.error('[workoutStorage] Failed to parse NOT_SAVED_WORKOUTS:', e)
		return
	}

	const originalLength = notSavedWorkouts.length
	const filteredWorkouts = notSavedWorkouts.filter((workout) => workout.startedAt !== startedAt)

	if (filteredWorkouts.length === originalLength) {
		console.warn('[workoutStorage] Unsaved workout not found for deletion, startedAt:', startedAt)
		return
	}

	if (filteredWorkouts.length === 0) {
		// если список стал пустым — можно удалить ключ целиком
		workoutStorage.remove(KEY_NOT_SAVED)
	} else {
		workoutStorage.set(KEY_NOT_SAVED, JSON.stringify(filteredWorkouts))
	}
}

export const assignIdToAnUnsavedWorkout = (startedAt: number, id: string): void => {
	const notSavedStr = workoutStorage.getString(KEY_NOT_SAVED)
	if (!notSavedStr) return

	let notSavedWorkouts: IWorkout[]
	try {
		notSavedWorkouts = JSON.parse(notSavedStr) as IWorkout[]
	} catch (e) {
		console.error('[workoutStorage] Failed to parse NOT_SAVED_WORKOUTS:', e)
		return
	}

	let updated = false

	const updatedWorkouts = notSavedWorkouts.map((workout) => {
		if (workout.startedAt === startedAt) {
			updated = true
			return {
				...workout,
				id
			}
		}
		return workout
	})

	if (!updated) {
		console.warn('[workoutStorage] Unsaved workout not found for startedAt:', startedAt)
		return
	}

	workoutStorage.set(KEY_NOT_SAVED, JSON.stringify(updatedWorkouts))
}

export const getNotSavedWorkouts = (): IWorkout[] => {
	const notSavedStr = workoutStorage.getString(KEY_NOT_SAVED)
	if (notSavedStr) {
		try {
			return JSON.parse(notSavedStr) as IWorkout[]
		} catch (e) {
			console.error('Failed to parse notSavedWorkouts:', e)
			return []
		}
	}
	return []
}

export const getShortWorkouts = (): IWorkout[] => {
	const shortWorkoutsStr = workoutStorage.getString(KEY_SHORT_WORKOUTS)
	if (shortWorkoutsStr) {
		try {
			return JSON.parse(shortWorkoutsStr) as IWorkout[]
		} catch (e) {
			console.error('Failed to parse shortWorkouts:', e)
			return []
		}
	}
	return []
}

export const getUnsavedWorkoutByStartedAt = (startedAt: number): IWorkout | null => {
	return getNotSavedWorkouts().find((w) => w.startedAt === startedAt) ?? null
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

export const startAndStoreNewActiveWorkout = (type: TrainingType, createdTrainingId: string | null) => {
	clearActiveWorkoutData()

	const newMeta: IWorkoutMeta = {
		id: createdTrainingId,
		type,
		startedAt: Date.now(),
		isPaused: false,
		totalPausedMs: 0,
		lastPauseAt: null,
		chunkCount: 1,
		nextPointId: 0
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

export const moveActiveWorkoutToShortWorkouts = () => {
	const fullActive = getFullActiveWorkout()

	if (fullActive) {
		const shortWorkoutsStr = workoutStorage.getString(KEY_SHORT_WORKOUTS)
		const shortWorkouts = shortWorkoutsStr ? (JSON.parse(shortWorkoutsStr) as IWorkout[]) : []

		const updatedShortWorkouts = [...shortWorkouts, fullActive]
		workoutStorage.set(KEY_SHORT_WORKOUTS, JSON.stringify(updatedShortWorkouts))

		clearActiveWorkoutData()
	}
}

export const setWorkoutItems = (workoutItems: LocationObject[]): IWorkoutLocationStorageItem[] => {
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)
	if (!metaStr) return []

	const meta = JSON.parse(metaStr) as IWorkoutMeta
	let currentChunkIdx = Math.max(0, meta.chunkCount - 1)
	let chunkKey = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${currentChunkIdx}`

	const rawBuffer = workoutStorage.getBuffer(chunkKey)
	let currentBuffer: Uint8Array | undefined = rawBuffer
		? new Uint8Array(rawBuffer as unknown as ArrayLike<number>)
		: undefined
	// let metaDirty = false

	// Массив для сохранения созданных элементов
	const savedItems: IWorkoutLocationStorageItem[] = []

	for (const workoutItem of workoutItems) {
		// [FIX] Защита от переполнения:
		// Если timestamp равен 0 (нет GPS времени) или меньше времени старта тренировки,
		// вычитание (timestamp - startedAt) даст отрицательное число.
		// В бинарном виде uint32 это превратится в огромное положительное число (~4 млрд).
		if (workoutItem.timestamp < meta.startedAt) {
			console.warn(
				'[workoutStorage] Ignored point with invalid timestamp:',
				workoutItem.timestamp,
				'startedAt:',
				meta.startedAt
			)
			continue
		}

		const relTs = workoutItem.timestamp - meta.startedAt
		const workoutItemToSave: IWorkoutLocationStorageItem = {
			pointId: meta.nextPointId++,
			relTs,
			isSavedToServer: false,
			locationObject: workoutItem,
			paused: meta.isPaused
		}

		savedItems.push(workoutItemToSave)

		const newBytes = serializeLocation(workoutItemToSave)
		const currentSize = currentBuffer ? currentBuffer.byteLength : 0
		const newSize = currentSize + newBytes.byteLength
		const chunkByteLimit = CHUNK_POINT_COUNT * POINT_BYTE_SIZE

		// Защита: одна точка больше лимита (крайний случай)
		if (newBytes.byteLength > chunkByteLimit) {
			console.warn(
				'[workoutStorage] Single serialized location exceeds chunk size limit:',
				newBytes.byteLength,
				'>',
				chunkByteLimit
			)
		}

		if (newSize > chunkByteLimit) {
			if (currentBuffer) {
				const exactBytes = currentBuffer.buffer.slice(
					currentBuffer.byteOffset,
					currentBuffer.byteOffset + currentBuffer.byteLength
				)
				workoutStorage.set(chunkKey, exactBytes as ArrayBuffer)
			}

			// Переходим к следующему чанку
			currentChunkIdx++
			chunkKey = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${currentChunkIdx}`
			currentBuffer = undefined // новый пустой чанк

			// Обновляем мету
			meta.chunkCount = currentChunkIdx + 1
			// metaDirty = true
		}

		// --- добавляем текущую точку в (возможно новый) чанк ---
		currentBuffer = appendBytes(currentBuffer, newBytes)
	}

	// Save last buffer state
	if (currentBuffer) {
		const exactBytes = currentBuffer.buffer.slice(
			currentBuffer.byteOffset,
			currentBuffer.byteOffset + currentBuffer.byteLength
		)
		workoutStorage.set(chunkKey, exactBytes as ArrayBuffer)
	}

	// if (metaDirty) { из-за nextPointId++ теперь сохранение меты каждый раз
	// 	workoutStorage.set(KEY_ACTIVE_META, JSON.stringify(meta))
	// }

	if (savedItems.length > 0) {
		workoutStorage.set(KEY_ACTIVE_META, JSON.stringify(meta))
	}

	// Возвращаем массив сохраненных элементов
	return savedItems
}

export const markUnsavedWorkoutPointsAsSaved = (startedAt: number, pointIds: number[]): void => {
	if (pointIds.length === 0) return

	const notSavedStr = workoutStorage.getString(KEY_NOT_SAVED)
	if (!notSavedStr) return

	let notSavedWorkouts: IWorkout[]
	try {
		notSavedWorkouts = JSON.parse(notSavedStr) as IWorkout[]
	} catch (e) {
		console.error('[workoutStorage] Failed to parse NOT_SAVED_WORKOUTS:', e)
		return
	}

	const idSet = new Set(pointIds)
	let updated = false

	const updatedWorkouts = notSavedWorkouts.map((workout) => {
		if (workout.startedAt !== startedAt) {
			return workout
		}

		let locationsUpdated = false

		const updatedLocations = workout.locations.map((point) => {
			if (!point.isSavedToServer && idSet.has(point.pointId)) {
				locationsUpdated = true
				return {
					...point,
					isSavedToServer: true
				}
			}
			return point
		})

		if (!locationsUpdated) {
			return workout
		}

		updated = true

		return {
			...workout,
			locations: updatedLocations
		}
	})

	if (!updated) {
		console.warn('[workoutStorage] No unsaved points found for startedAt:', startedAt)
		return
	}

	workoutStorage.set(KEY_NOT_SAVED, JSON.stringify(updatedWorkouts))
}

export const markPointsAsSaved = (pointIds: number[]) => {
	if (pointIds.length === 0) return

	const meta = getWorkoutMeta()
	if (!meta) return

	const idSet = new Set(pointIds)
	const minId = Math.min(...pointIds)
	const maxId = Math.max(...pointIds)

	for (let chunkIndex = 0; chunkIndex < meta.chunkCount; chunkIndex++) {
		const key = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${chunkIndex}`
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

export const getActiveWorkoutPoints = (deserializeGetterType: deserializeGetterType): IWorkoutLocationStorageItem[] => {
	const meta = getWorkoutMeta()
	if (!meta) return []

	const result: IWorkoutLocationStorageItem[] = []

	for (let chunkIndex = 0; chunkIndex < meta.chunkCount; chunkIndex++) {
		const key = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${chunkIndex}`
		const buffer = workoutStorage.getBuffer(key)
		if (!buffer) continue
		const points = deserializeLocations(new Uint8Array(buffer), meta?.startedAt, deserializeGetterType)

		result.push(...points)
	}

	return result
}

export const removeAllShortWorkouts = (): void => {
	const shortWorkoutsStr = workoutStorage.getString(KEY_SHORT_WORKOUTS)
	if (!shortWorkoutsStr) {
		return
	}

	workoutStorage.remove(KEY_SHORT_WORKOUTS)
}

export const removeAllWorkoutStorage = () => {
	workoutStorage.clearAll()
}

// --- Helpers ---

export const clearActiveWorkoutData = () => {
	const metaStr = workoutStorage.getString(KEY_ACTIVE_META)
	if (metaStr) {
		try {
			const meta = JSON.parse(metaStr) as IWorkoutMeta
			// Удаляем все известные чанки
			for (let i = 0; i < meta.chunkCount + 2; i++) {
				// +2 на случай рассинхрона
				workoutStorage.remove(`${KEY_ACTIVE_BIN_CHUNK_PREFIX}${i}`)
			}
		} catch (e) {
			console.warn('Failed to parse meta for cleanup', e)
			// Fallback: если мета битая, придется использовать getAllKeys
			const keys = workoutStorage.getAllKeys()
			for (const key of keys) {
				if (key.startsWith(KEY_ACTIVE_BIN_CHUNK_PREFIX)) {
					workoutStorage.remove(key)
				}
			}
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

/**
 * Получить конкретный чанк тренировки по индексу
 */
export const getWorkoutChunk = (chunkIndex: number, startedAt: number): IWorkoutLocationStorageItem[] => {
	const chunkKey = `${KEY_ACTIVE_BIN_CHUNK_PREFIX}${chunkIndex}`
	const chunkBuffer = workoutStorage.getBuffer(chunkKey)

	if (chunkBuffer) {
		return deserializeLocations(new Uint8Array(chunkBuffer), startedAt, deserializeGetterType.ALL)
	}
	return []
}

const getActiveWorkoutFromStorage = (meta: IWorkoutMeta): IWorkout => {
	let locations: IWorkoutLocationStorageItem[] = []

	for (let i = 0; i < meta.chunkCount; i++) {
		const chunkBuffer = workoutStorage.getBuffer(`${KEY_ACTIVE_BIN_CHUNK_PREFIX}${i}`)
		if (chunkBuffer) {
			const chunkPoints = deserializeLocations(
				new Uint8Array(chunkBuffer),
				meta.startedAt,
				deserializeGetterType.ALL
			)
			locations = locations.concat(chunkPoints)
		}
	}

	return {
		id: meta.id,
		type: meta.type,
		startedAt: meta.startedAt,
		isPaused: meta.isPaused,
		totalPausedMs: meta.totalPausedMs,
		lastPauseAt: meta.lastPauseAt,
		locations
	}
}

// export const getAllWorkoutStorage = (): IWorkoutStorage => {
// 	const notSavedStr = workoutStorage.getString(KEY_NOT_SAVED)
// 	const notSavedWorkouts = notSavedStr ? (JSON.parse(notSavedStr) as IWorkout[]) : []
//
// 	return {
// 		notSavedWorkouts,
// 		activeWorkout: getFullActiveWorkout()
// 	}
// }
