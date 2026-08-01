import { IPoint } from '@/types/interfaces'

export interface SmoothMarkerPositionOptions {
	durationMs?: number
	immediate?: boolean
	speedMps?: number | null
	timestamp?: number | null
}

export type SmoothMarkerPositionInput = number | SmoothMarkerPositionOptions

const EARTH_RADIUS_METERS = 6_371_000
const MIN_ANIMATION_MS = 250
const MAX_ANIMATION_MS = 4_500
const DEFAULT_ANIMATION_MS = 900
const MIN_DISTANCE_TO_ANIMATE_METERS = 0.35
const MIN_RELIABLE_SPEED_MPS = 0.4
const MAX_RELIABLE_SPEED_MPS = 35
const MIN_RELIABLE_SAMPLE_MS = 250
const MAX_RELIABLE_SAMPLE_MS = 10_000

function isFiniteNumber(value: unknown): value is number {
	return typeof value === 'number' && Number.isFinite(value)
}

function clamp(value: number, min: number, max: number) {
	return Math.min(Math.max(value, min), max)
}

function toRadians(degrees: number) {
	return (degrees * Math.PI) / 180
}

function getDistanceMeters(from: IPoint, to: IPoint) {
	const dLat = toRadians(to.lat - from.lat)
	const dLon = toRadians(to.lon - from.lon)
	const fromLat = toRadians(from.lat)
	const toLat = toRadians(to.lat)

	const a = Math.sin(dLat / 2) ** 2 + Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLon / 2) ** 2
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

	return EARTH_RADIUS_METERS * c
}

function normalizeMoveOptions(input?: SmoothMarkerPositionInput): SmoothMarkerPositionOptions {
	if (typeof input === 'number') return { durationMs: input }
	return input ?? {}
}

function getReliableDeltaMs(current?: number | null, previous?: number | null) {
	if (!isFiniteNumber(current) || !isFiniteNumber(previous)) return null

	const deltaMs = current - previous
	if (deltaMs < MIN_RELIABLE_SAMPLE_MS || deltaMs > MAX_RELIABLE_SAMPLE_MS) return null

	return deltaMs
}

export function getSmoothMarkerMoveDurationMs(params: {
	from: IPoint | null
	to: IPoint
	input?: SmoothMarkerPositionInput
	lastReceivedAt: number | null
	lastTimestamp: number | null
	now?: number
}) {
	const options = normalizeMoveOptions(params.input)
	if (options.immediate) return 0
	if (isFiniteNumber(options.durationMs)) return Math.max(0, Math.round(options.durationMs))
	if (!params.from) return DEFAULT_ANIMATION_MS

	const distanceMeters = getDistanceMeters(params.from, params.to)
	if (distanceMeters < MIN_DISTANCE_TO_ANIMATE_METERS) return MIN_ANIMATION_MS

	const now = params.now ?? Date.now()
	const locationDeltaMs = getReliableDeltaMs(options.timestamp, params.lastTimestamp)
	const receivedDeltaMs = getReliableDeltaMs(now, params.lastReceivedAt)
	const sampleDeltaMs = locationDeltaMs ?? receivedDeltaMs
	const speedMps = options.speedMps
	const hasReliableSpeed =
		isFiniteNumber(speedMps) && speedMps >= MIN_RELIABLE_SPEED_MPS && speedMps <= MAX_RELIABLE_SPEED_MPS
	const speedDurationMs = hasReliableSpeed ? (distanceMeters / speedMps) * 1000 : null

	let durationMs = DEFAULT_ANIMATION_MS
	if (speedDurationMs !== null && sampleDeltaMs !== null) {
		durationMs = clamp(speedDurationMs, sampleDeltaMs * 0.55, sampleDeltaMs * 1.75)
	} else if (speedDurationMs !== null) {
		durationMs = speedDurationMs
	} else if (sampleDeltaMs !== null) {
		durationMs = sampleDeltaMs * 1.05
	}

	return Math.round(clamp(durationMs, MIN_ANIMATION_MS, MAX_ANIMATION_MS))
}
