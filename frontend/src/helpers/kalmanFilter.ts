import { ITrainingPoint } from '@/api/workout'

/** Базовый 1D Калмановский фильтр */
class Kalman1D {
	private x: number
	private p: number
	private q: number
	private r: number

	constructor({ q = 0.00001, r = 0.01, x0 = 0, p0 = 1 } = {}) {
		this.x = x0
		this.p = p0
		this.q = q
		this.r = r
	}

	/**
	 * measurement — измеренное значение
	 * rFactor — множитель шума измерения (увеличивается при плохом accuracy)
	 */
	update(measurement: number, rFactor = 1) {
		// Prediction
		this.p += this.q

		// Обновляем R динамически от accuracy
		const R = this.r * rFactor

		// Correction
		const k = this.p / (this.p + R)
		this.x += k * (measurement - this.x)
		this.p = (1 - k) * this.p

		return this.x
	}
}

/**
 * Dynamic accuracy-based Kalman smoothing for GPS route
 */
export function kalmanFilter(points: ITrainingPoint[]): ITrainingPoint[] {
	if (!points.length) return []

	const latKF = new Kalman1D({ q: 0.0000005, r: 0.0001, x0: points[0].lat })
	const lngKF = new Kalman1D({ q: 0.0000005, r: 0.0001, x0: points[0].lng })
	const altKF = new Kalman1D({ q: 0.001, r: 1, x0: points[0].alt })

	const smoothed: ITrainingPoint[] = []

	for (const p of points) {
		const acc = p.locationObject?.coords?.accuracy ?? 15

		/**
		 * rFactor:
		 *  accuracy < 10  → 1      (доверяем)
		 *  accuracy 10–30 → 2–4    (среднее)
		 *  accuracy > 50  → 6–10   (сильно шумно)
		 */
		const rFactor =
			acc < 10 ? 1 : acc < 30 ? 1 + (acc - 10) * 0.15 : acc < 50 ? 4 + (acc - 30) * 0.15 : 7 + (acc - 50) * 0.08

		const lat = latKF.update(p.lat, rFactor)
		const lng = lngKF.update(p.lng, rFactor)
		const alt = altKF.update(p.alt, rFactor)

		smoothed.push({
			...p,
			lat,
			lng,
			alt
		})
	}

	return smoothed
}
