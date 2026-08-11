import type { MMKV } from 'react-native-mmkv'

// ============================================================
// Версионирование workout-хранилища.
//
// Схема: глобальный ключ-версия + упорядоченный реестр идемпотентных миграций.
// Миграции запускаются при старте (а также при первом импорте модуля workoutStorage)
// до любого чтения данных. Реестр пуст, пока приложение не опубликовано, но
// архитектура готова: изменение формата = новая миграция + бамп WORKOUT_STORAGE_VERSION.
//
// Правила:
//  - WORKOUT_STORAGE_VERSION бампается при любом изменении JSON-схем значений,
//    которые лежат под ключами workoutStorage (meta, списки NOT_SAVED/SHORT).
//  - Бинарный формат чанков версионируется отдельно (CHUNK_VERSION в binarySerializer).
// ============================================================

export const WORKOUT_STORAGE_VERSION = 1
export const STORAGE_VERSION_KEY = '@@workout_storage_version'

export interface IStorageMigration {
	version: number
	up: (storage: MMKV) => void
}

// Миграции применяются строго по возрастанию version.
export const WORKOUT_STORAGE_MIGRATIONS: IStorageMigration[] = []

export const safeParse = <T>(raw: string | undefined, fallback: T): T => {
	if (!raw) return fallback

	try {
		return JSON.parse(raw) as T
	} catch (e) {
		console.warn('[workoutStorage] safeParse error:', e)
		return fallback
	}
}

export const runWorkoutStorageMigrations = (storage: MMKV): void => {
	const storedVersion = storage.getNumber(STORAGE_VERSION_KEY) ?? 0

	if (storedVersion >= WORKOUT_STORAGE_VERSION) {
		return
	}

	const pending = WORKOUT_STORAGE_MIGRATIONS.filter(
		(migration) => migration.version > storedVersion && migration.version <= WORKOUT_STORAGE_VERSION
	).sort((a, b) => a.version - b.version)

	for (const migration of pending) {
		try {
			migration.up(storage)
		} catch (e) {
			console.warn(`[workoutStorage] migration v${migration.version} failed:`, e)
		}
	}

	storage.set(STORAGE_VERSION_KEY, WORKOUT_STORAGE_VERSION)
}
