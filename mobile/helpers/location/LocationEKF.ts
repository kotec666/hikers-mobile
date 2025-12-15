/* ============================================================
 *  LocationEKF — Production GPS EKF (Variant B)
 * ============================================================ */

const EARTH_RADIUS = 6378137

/* ------------------ Helpers ------------------ */

function deg2rad(d: number) {
	return (d * Math.PI) / 180
}

function rad2deg(r: number) {
	return (r * 180) / Math.PI
}

function latLngToENU(lat: number, lng: number, lat0: number, lng0: number) {
	const dLat = deg2rad(lat - lat0)
	const dLng = deg2rad(lng - lng0)

	const x = dLng * Math.cos(deg2rad(lat0)) * EARTH_RADIUS
	const y = dLat * EARTH_RADIUS

	return { x, y }
}

function enuToLatLng(x: number, y: number, lat0: number, lng0: number) {
	return {
		lat: lat0 + rad2deg(y / EARTH_RADIUS),
		lng: lng0 + rad2deg(x / (EARTH_RADIUS * Math.cos(deg2rad(lat0))))
	}
}

function diag(v: number[]): number[][] {
	return v.map((x, i) => v.map((_, j) => (i === j ? x : 0)))
}

function clamp(x: number, a: number, b: number) {
	return Math.max(a, Math.min(b, x))
}

/* ------------------ EKF ------------------ */

export class LocationEKF {
	// state: [x, y, vx, vy, heading]
	private x = [0, 0, 0, 0, 0]
	private P: number[][] = []

	private lat0 = 0
	private lng0 = 0
	private lastTs = 0
	private initialized = false

	constructor(
		private readonly processNoise = 1.2, // motion uncertainty
		private readonly minAccuracy = 5, // meters
		private readonly maxSpeed = 7 // m/s (run)
	) {}

	/* ---------- lifecycle ---------- */

	reset(lat: number, lng: number, ts: number) {
		this.lat0 = lat
		this.lng0 = lng
		this.lastTs = ts

		this.x = [0, 0, 0, 0, 0]
		this.P = diag([
			25, // x
			25, // y
			9, // vx
			9, // vy
			0.5 // heading
		])

		this.initialized = true
	}

	/* ---------- main update ---------- */

	update(params: {
		lat: number
		lng: number
		accuracy?: number | null
		timestamp: number
		speed?: number | null
		headingDeg?: number | null
	}): { lat: number; lng: number } {
		const { lat, lng, accuracy = 10, timestamp, speed, headingDeg } = params

		/* ---------- init ---------- */

		if (!this.initialized) {
			this.reset(lat, lng, timestamp)
			return { lat, lng }
		}

		const dt = (timestamp - this.lastTs) / 1000
		this.lastTs = timestamp

		if (dt <= 0 || dt > 10) {
			return this.currentLatLng()
		}

		const acc = Math.max(accuracy, this.minAccuracy)

		/* ---------- hard gating ---------- */

		if (acc > 30) {
			// плохая точка — игнор
			return this.currentLatLng()
		}

		if (speed != null && speed > this.maxSpeed + 2) {
			return this.currentLatLng()
		}

		/* ---------- prediction ---------- */

		if (speed != null && speed > 0.5 && headingDeg != null && headingDeg >= 0) {
			const h = deg2rad(headingDeg)
			this.x[2] = speed * Math.cos(h)
			this.x[3] = speed * Math.sin(h)
			this.x[4] = h
		}

		this.x[0] += this.x[2] * dt
		this.x[1] += this.x[3] * dt

		const q = this.processNoise
		this.P[0][0] += q * dt
		this.P[1][1] += q * dt
		this.P[2][2] += q
		this.P[3][3] += q
		this.P[4][4] += 0.01

		/* ---------- measurement ---------- */

		const z = latLngToENU(lat, lng, this.lat0, this.lng0)

		const yx = z.x - this.x[0]
		const yy = z.y - this.x[1]

		const Rm = acc * acc

		const Sx = this.P[0][0] + Rm
		const Sy = this.P[1][1] + Rm

		const K = [this.P[0][0] / Sx, this.P[1][1] / Sy, this.P[2][0] / Sx, this.P[3][1] / Sy, 0]

		this.x[0] += K[0] * yx
		this.x[1] += K[1] * yy
		this.x[2] += K[2] * yx
		this.x[3] += K[3] * yy

		this.P[0][0] *= 1 - K[0]
		this.P[1][1] *= 1 - K[1]

		return this.currentLatLng()
	}

	/* ---------- output ---------- */

	private currentLatLng() {
		return enuToLatLng(this.x[0], this.x[1], this.lat0, this.lng0)
	}
}
