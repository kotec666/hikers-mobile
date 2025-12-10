import { ITrainingPoint } from '@/api/workout'

/** Базовый 1D КФ */
class Kalman1D {
	private x: number
	private p: number
	private r: number
	private q: number

	constructor({ q = 0.00001, r = 0.01, x0 = 0, p0 = 1 } = {}) {
		this.x = x0
		this.p = p0
		this.q = q
		this.r = r
	}

	update(measurement: number) {
		// Prediction
		this.p = this.p + this.q

		// Correction
		const k = this.p / (this.p + this.r)
		this.x = this.x + k * (measurement - this.x)
		this.p = (1 - k) * this.p

		return this.x
	}
}

/**
 * Калмановская фильтрация 3D GPS: lat, lng, alt
 */
export function kalmanFilter(points: ITrainingPoint[]): ITrainingPoint[] {
	if (!points.length) return []

	const latKF = new Kalman1D({ q: 0.000001, r: 0.0001, x0: points[0].lat })
	const lngKF = new Kalman1D({ q: 0.000001, r: 0.0001, x0: points[0].lng })
	const altKF = new Kalman1D({ q: 0.001, r: 1, x0: points[0].alt })

	const result: ITrainingPoint[] = []

	for (const p of points) {
		const filteredLat = latKF.update(p.lat)
		const filteredLng = lngKF.update(p.lng)
		const filteredAlt = altKF.update(p.alt)

		result.push({
			...p,
			lat: filteredLat,
			lng: filteredLng,
			alt: filteredAlt
		})
	}

	return result
}
