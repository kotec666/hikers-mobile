import { createMMKV } from 'react-native-mmkv'
import { addDays, isBefore } from 'date-fns'

export const batteryStorage = createMMKV({
	id: 'battery-storage'
})

const BATTERY_STORAGE_DISMISSED_AT_KEY = 'BATTERY_STORAGE_OPTIMIZATION_DISMISSED_AT'

/** Через сколько дней после закрытия крестиком снова показывать баннер */
const BATTERY_STORAGE_SNOOZE_DAYS = 3

/** Сохранить момент закрытия баннера крестиком */
export const setBatteryOptimizationDismissedAt = () => {
	batteryStorage.set(BATTERY_STORAGE_DISMISSED_AT_KEY, Date.now())
}

/** true — если баннер закрывали недавно (в пределах BATTERY_STORAGE_SNOOZE_DAYS) и показывать его пока не нужно */
export const isBatteryOptimizationSnoozed = (): boolean => {
	const dismissedAt = batteryStorage.getNumber(BATTERY_STORAGE_DISMISSED_AT_KEY)

	if (!dismissedAt) return false

	const snoozedUntil = addDays(new Date(dismissedAt), BATTERY_STORAGE_SNOOZE_DAYS)

	return isBefore(new Date(), snoozedUntil)
}
