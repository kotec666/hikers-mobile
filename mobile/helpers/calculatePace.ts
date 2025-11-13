/**
 * Рассчитывает средний темп (мин:сек/км)
 * @param totalMs общее время в миллисекундах
 * @param totalDistanceMeters общая дистанция в метрах
 * @returns строка вида 05’24”/км
 */
export const calculatePace = (totalMs: number, totalDistanceMeters: number): string => {
	if (!totalDistanceMeters || totalDistanceMeters < 10 || !totalMs) return '—’—”'

	const totalSeconds = totalMs / 1000
	const distanceKm = totalDistanceMeters / 1000

	const paceSecPerKm = totalSeconds / distanceKm
	if (!isFinite(paceSecPerKm) || paceSecPerKm <= 0) return '—’—”'

	const minutes = Math.floor(paceSecPerKm / 60)
	const seconds = Math.round(paceSecPerKm % 60)

	return `${minutes.toString().padStart(2, '0')}’${seconds.toString().padStart(2, '0')}”`
}
