import { addMilliseconds, formatISO, isBefore, parseISO } from 'date-fns'

import { createMMKV } from 'react-native-mmkv'

export const timerStorage = createMMKV({
	id: 'timer-storage'
})

const timerStorageKey = 'TIMER_STORAGE'

//
// TYPES
//

export enum TimerType {
	EMAIL_CONFIRMATION = 'email_confirmation',
	PASSWORD_RECOVERY = 'password_recovery'
}

interface IBaseTimerInfo {
	startedAt: string
	expiresAt: string
}

export type IEmailConfirmationTimer = IBaseTimerInfo
export type IPasswordRecoveryTimer = IBaseTimerInfo

interface ITimerTypeMap {
	[TimerType.EMAIL_CONFIRMATION]: IEmailConfirmationTimer
	[TimerType.PASSWORD_RECOVERY]: IPasswordRecoveryTimer
}

type TimerCollection<T> = Record<string, T>

interface ITimerStorage {
	[TimerType.EMAIL_CONFIRMATION]: TimerCollection<IEmailConfirmationTimer>
	[TimerType.PASSWORD_RECOVERY]: TimerCollection<IPasswordRecoveryTimer>
}

//
// INITIAL STORAGE
//

const initialTimerStorage: ITimerStorage = {
	email_confirmation: {},
	password_recovery: {}
}

//
// BASE
//

const getStorage = (): ITimerStorage => {
	const storageStr = timerStorage.getString(timerStorageKey)

	if (!storageStr) {
		timerStorage.set(timerStorageKey, JSON.stringify(initialTimerStorage))

		return initialTimerStorage
	}

	try {
		return JSON.parse(storageStr) as ITimerStorage
	} catch {
		return initialTimerStorage
	}
}

const setStorage = (storage: ITimerStorage) => {
	timerStorage.set(timerStorageKey, JSON.stringify(storage))
}

//
// GET TIMER
//

export const getTimer = <T extends TimerType>(type: T, email: string): ITimerTypeMap[T] | null => {
	const storage = getStorage()

	return (storage[type][email] as ITimerTypeMap[T]) || null
}

//
// CREATE TIMER
//

const createTimerObject = (ms: number): IBaseTimerInfo => {
	const currentDate = new Date()

	return {
		startedAt: formatISO(currentDate),
		expiresAt: formatISO(addMilliseconds(currentDate, ms))
	}
}

export const createTimer = (type: TimerType, email: string, ms: number) => {
	if (ms <= 0) return
	const storage = getStorage()

	storage[type][email] = createTimerObject(ms)

	setStorage(storage)
}

//
// REMOVE TIMER
//

export const removeTimer = (type: TimerType, email: string) => {
	const storage = getStorage()

	delete storage[type][email]

	setStorage(storage)
}

//
// CLEAR EXPIRED TIMERS
//

export const clearExpiredTimers = () => {
	const storage = getStorage()

	const now = new Date()

	;(Object.keys(storage) as TimerType[]).forEach((type) => {
		const timers = storage[type]

		Object.entries(timers).forEach(([email, timer]) => {
			if (isBefore(parseISO(timer.expiresAt), now)) {
				delete timers[email]
			}
		})
	})

	setStorage(storage)
}

//
// IS RATE LIMITED
//

export const isRateLimited = (type: TimerType, email: string) => {
	const timer = getTimer(type, email)

	if (!timer) {
		return false
	}

	return isBefore(new Date(), parseISO(timer.expiresAt))
}

//
// GET REMAINING TIME
//

export const getRemainingTime = (type: TimerType, email: string) => {
	const timer = getTimer(type, email)

	if (!timer) {
		return 0
	}

	const expiresAt = parseISO(timer.expiresAt).getTime()

	const now = Date.now()

	return Math.max(0, Math.floor((expiresAt - now) / 1000))
}
