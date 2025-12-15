export class GPSKalmanFilter {
	private variance = -1
	private timestamp = 0
	private lat = 0
	private lng = 0

	constructor(
		private readonly decay: number = 3, // м/с (ходьба)
		private readonly minAccuracy: number = 5 // meters
	) {}

	// Геттеры для безопасного доступа
	getLat() {
		return this.lat
	}
	getLng() {
		return this.lng
	}
	getTimestamp() {
		return this.timestamp
	}

	filter(
		lat: number,
		lng: number,
		accuracy: number,
		timestamp: number,
		speedMps?: number | null
	): { lat: number; lng: number } {
		if (accuracy < this.minAccuracy) {
			accuracy = this.minAccuracy
		}

		const speedFactor = speedMps && speedMps > 0 ? Math.min(Math.max(speedMps / 3, 0.5), 3) : 1
		const effectiveDecay = this.decay * speedFactor

		// Инициализация
		if (this.variance < 0) {
			this.lat = lat
			this.lng = lng
			this.timestamp = timestamp
			this.variance = accuracy * accuracy
			return { lat, lng }
		}

		// Ограничиваем dt для анти-спайка
		let dt = Math.min(timestamp - this.timestamp, 120_000) // максимум 2 минуты
		if (dt <= 0) return { lat: this.lat, lng: this.lng }

		// Рост неопределенности
		this.variance += (dt * effectiveDecay * effectiveDecay) / 1000
		this.timestamp = timestamp

		// Kalman gain
		const k = this.variance / (this.variance + accuracy * accuracy)

		// корректировка позиции
		this.lat += k * (lat - this.lat)
		this.lng += k * (lng - this.lng)

		// обновление дисперсии
		this.variance = (1 - k) * this.variance

		return { lat: this.lat, lng: this.lng }
	}

	reset(lat: number, lng: number, accuracy: number, timestamp: number) {
		this.lat = lat
		this.lng = lng
		this.timestamp = timestamp
		this.variance = accuracy * accuracy
	}
}
