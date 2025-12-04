import { LocationObject } from 'expo-location'

/**
 * Генератор бесконечного маршрута с сегментами
 */
export class InfiniteMockRoute {
	private currentLat: number
	private currentLng: number
	private timestamp: number
	private currentHeading: number

	constructor(startLat: number, startLng: number, startHeading: number = 180) {
		this.currentLat = startLat
		this.currentLng = startLng
		this.timestamp = Date.now()
		this.currentHeading = startHeading
	}

	/**
	 * Генерация следующей порции точек
	 * @param segmentLength количество точек в одном сегменте
	 * @param step расстояние между точками
	 * @param maxSegments количество сегментов, которые будут созданы за один вызов
	 */
	public nextPoints(segmentLength: number = 10, step: number = 0.0001, maxSegments: number = 2): LocationObject[] {
		const points: LocationObject[] = []

		for (let seg = 0; seg < maxSegments; seg++) {
			const rad = (this.currentHeading * Math.PI) / 180

			for (let i = 0; i < segmentLength; i++) {
				const latOffset = Math.cos(rad) * step + (Math.random() - 0.5) * step * 0.2
				const lngOffset = Math.sin(rad) * step + (Math.random() - 0.5) * step * 0.2

				const newLat = this.currentLat + latOffset
				const newLng = this.currentLng + lngOffset

				points.push({
					coords: {
						latitude: newLat,
						longitude: newLng,
						accuracy: 5,
						altitude: 195,
						altitudeAccuracy: 1,
						heading: this.currentHeading,
						speed: 1 + Math.random() // 1–2 м/с
					},
					mocked: true,
					timestamp: this.timestamp
				})

				this.currentLat = newLat
				this.currentLng = newLng
				this.timestamp += 1000
			}

			// Делаем поворот после сегмента: случайный угол 60–120° влево или вправо
			const turnAngle = (Math.random() < 0.5 ? -1 : 1) * (60 + Math.random() * 60)
			this.currentHeading = (this.currentHeading + turnAngle + 360) % 360
		}

		return points
	}
}
