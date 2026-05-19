import {
	EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS,
	MAX_PASSWORD_RECOVERY_ATTEMPTS,
	PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS,
	PASSWORD_RECOVERY_CODE_TIMEOUT_MS
} from '@/shared/constants'

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

export interface IPasswordRecoveryTimer extends IBaseTimerInfo {
	attempts: number
	timeoutExpiresAt?: string
}

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
// CONFIG
//

const TIMER_CONFIG = {
	[TimerType.EMAIL_CONFIRMATION]: {
		rateLimitMs: EMAIL_CONFIRMATION_CODE_RATE_LIMIT_MS
	},

	[TimerType.PASSWORD_RECOVERY]: {
		rateLimitMs: PASSWORD_RECOVERY_CODE_RATE_LIMIT_MS,
		timeoutMs: PASSWORD_RECOVERY_CODE_TIMEOUT_MS,
		maxAttempts: MAX_PASSWORD_RECOVERY_ATTEMPTS
	}
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

export const createTimer = (type: TimerType, email: string) => {
	const storage = getStorage()

	const currentDate = new Date()

	const config = TIMER_CONFIG[type]

	const baseTimer = {
		startedAt: formatISO(currentDate),
		expiresAt: formatISO(addMilliseconds(currentDate, config.rateLimitMs))
	}

	if (type === TimerType.EMAIL_CONFIRMATION) {
		storage[type][email] = baseTimer
	}

	if (type === TimerType.PASSWORD_RECOVERY) {
		storage[type][email] = {
			...baseTimer,
			attempts: 0
		}
	}

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
// PASSWORD RECOVERY
//

export const incrementPasswordRecoveryAttempts = (email: string) => {
	const storage = getStorage()

	const timer = storage.password_recovery[email]

	if (!timer) {
		return
	}

	timer.attempts += 1

	const config = TIMER_CONFIG.password_recovery

	if (timer.attempts >= config.maxAttempts) {
		timer.timeoutExpiresAt = formatISO(addMilliseconds(new Date(), config.timeoutMs))
	}

	setStorage(storage)
}

//
// CHECK RECOVERY BLOCK
//

export const isPasswordRecoveryBlocked = (email: string) => {
	const timer = getTimer(TimerType.PASSWORD_RECOVERY, email)

	if (!timer?.timeoutExpiresAt) {
		return false
	}

	return isBefore(new Date(), parseISO(timer.timeoutExpiresAt))
}

//
// RESET ATTEMPTS
//

export const resetPasswordRecoveryAttempts = (email: string) => {
	const storage = getStorage()

	const timer = storage.password_recovery[email]

	if (!timer) {
		return
	}

	timer.attempts = 0

	delete timer.timeoutExpiresAt

	setStorage(storage)
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
