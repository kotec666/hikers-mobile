import {
	detectSteps,
	estimateStepLength,
	computeHeading,
	classifyMotion,
	particleFilterUpdate,
	correctHeading,
	correctStepLength,
	PDRState,
	Vector3,
	defaultConfig,
	MotionClassification
} from './pdrAlgorithm'
import { metersToLatLng } from '@/helpers/location/metersToLatLng'

interface GyroData {
	alpha: number
	beta: number
	gamma: number
}

interface SensorState {
	orientationAngle: number

	rawAcceleration: Vector3
	rawGyroscope: GyroData
	rawMagnetometer: Vector3
	barometricPressure: number

	pdr: PDRState
}

const initialPDR: PDRState = {
	x: 0,
	y: 0,
	z: 0,
	lastStepTime: 0,
	stepCount: 0,
	lastAccelMag: 0,

	headingBias: 0,
	deviceContext: 'holding',
	motionState: MotionClassification.WALKING,
	particles: Array(150)
		.fill(0)
		.map(() => ({
			x: 0,
			y: 0,
			heading: 0,
			weight: 1 / 150
		}))
}

const initialState: SensorState = {
	orientationAngle: 0,

	rawAcceleration: { x: 0, y: 0, z: 0 },
	rawGyroscope: { alpha: 0, beta: 0, gamma: 0 },
	rawMagnetometer: { x: 0, y: 0, z: 0 },
	barometricPressure: 1013.25,

	pdr: initialPDR
}

export class DeadReckoningEngine {
	private state: SensorState

	private geoAnchor: {
		lat: number
		lng: number
		alt: number
	} | null = null

	constructor() {
		this.state = initialState
	}

	alignOrientation(orientationAngle: number) {
		this.state.orientationAngle = orientationAngle
	}

	setStartingPosition(vector: Vector3) {
		this.state.pdr.x = vector.x
		this.state.pdr.y = vector.y
		this.state.pdr.z = vector.z
	}

	setGeoAnchor(anchor: { lat: number; lng: number; alt: number }) {
		this.geoAnchor = anchor
		this.setStartingPosition({ x: 0, y: 0, z: 0 })
	}

	getGeoPosition() {
		if (!this.geoAnchor) return null

		const { lat, lng, alt } = this.geoAnchor
		const { x, y, z } = this.state.pdr

		// y north
		// x east

		const geo = metersToLatLng(lat, lng, y, x)

		return {
			latitude: geo.lat,
			longitude: geo.lng,
			altitude: alt + z
		}
	}

	updateSensors(
		acceleration: Vector3,
		gyroscope: GyroData,
		magnetometer: Vector3,
		barometricPressure: number,
		orientationAngle?: number
	) {
		this.state.rawAcceleration = acceleration
		this.state.rawGyroscope = gyroscope
		this.state.rawMagnetometer = magnetometer
		this.state.barometricPressure = barometricPressure

		if (orientationAngle !== undefined) {
			this.state.orientationAngle = orientationAngle
		}
	}

	updateRealTimePosition() {
		const nowSec = Date.now() / 1000.0
		const accel = this.state.rawAcceleration

		// 1) Step detection
		const stepDetected = detectSteps(accel, nowSec, this.state.pdr)
		if (stepDetected) {
			const dt = nowSec - this.state.pdr.lastStepTime
			const stepFreq = dt > 0 ? 1 / dt : 1
			const accelVar = 0.3
			const gyroVar = 2.0

			// 2) Classify motion
			const motion = classifyMotion(accelVar, gyroVar)
			this.state.pdr.motionState = motion

			// 3) Step length => multiply if you want "1 step => 1 grid cell"
			let Ls = estimateStepLength(stepFreq, accelVar, motion, this.state.pdr.deviceContext)
			Ls = correctStepLength(Ls, motion, defaultConfig)
			// Ls = Ls * 5 // e.g., x5 to make 1 step = 1 grid cell @TODO

			// 4) Use orientationAngle directly: no +90 shift
			let headingDeg = computeHeading(this.state.orientationAngle, null)

			headingDeg = correctHeading(headingDeg, this.state.pdr.headingBias, defaultConfig)

			// 5) Particle Filter => final pdr.x, pdr.y
			particleFilterUpdate(this.state.pdr, Ls, headingDeg, defaultConfig)
		}

		// Store last acceleration magnitude
		const { x: ax, y: ay, z: az } = accel
		this.state.pdr.lastAccelMag = Math.sqrt(ax * ax + ay * ay + az * az)

		return stepDetected
	}

	getState(): SensorState {
		return this.state
	}
}
