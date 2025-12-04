import { LocationObject } from 'expo-location'

type Segment = {
	heading: number // направление движения в градусах (0 — север, 90 — восток)
	length: number // количество точек в сегменте
	step: number // шаг между точками (~0.0001 ≈ 11м)
}

/**
 * Генератор маршрута с сегментами: движение по прямой → поворот → движение по прямой
 */
export class StructuredMockRoute {
	private currentLat: number
	private currentLng: number
	private timestamp: number

	constructor(startLat: number, startLng: number) {
		this.currentLat = startLat
		this.currentLng = startLng
		this.timestamp = Date.now()
	}

	/**
	 * Генерация точек для последовательности сегментов
	 */
	public nextPoints(segments: Segment[]): LocationObject[] {
		const points: LocationObject[] = []

		for (const seg of segments) {
			const rad = (seg.heading * Math.PI) / 180
			for (let i = 0; i < seg.length; i++) {
				// небольшие случайные отклонения для реалистичности
				const latOffset = Math.cos(rad) * seg.step + (Math.random() - 0.5) * seg.step * 0.2
				const lngOffset = Math.sin(rad) * seg.step + (Math.random() - 0.5) * seg.step * 0.2

				const newLat = this.currentLat + latOffset
				const newLng = this.currentLng + lngOffset

				points.push({
					coords: {
						latitude: newLat,
						longitude: newLng,
						accuracy: 5,
						altitude: 195,
						altitudeAccuracy: 1,
						heading: seg.heading,
						speed: 1 + Math.random() // 1–2 м/с
					},
					mocked: true,
					timestamp: this.timestamp
				})

				// обновляем текущее положение
				this.currentLat = newLat
				this.currentLng = newLng
				this.timestamp += 1000
			}
		}

		return points
	}
}
