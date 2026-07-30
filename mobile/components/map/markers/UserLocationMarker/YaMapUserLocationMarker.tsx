import React, { forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react'
import { Marker, MarkerRef, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'
import YaMapAccuracyCircle, {
	YaMapAccuracyCircleHandle
} from '@/components/map/markers/UserLocationMarker/YaMapAccuracyCircle'
import {
	getSmoothMarkerMoveDurationMs,
	SmoothMarkerPositionInput
} from '@/components/map/markers/UserLocationMarker/smoothMarkerMovement'

interface IProps {
	color?: string
	triangleScale?: number
	debugAccuracyM?: number
	initialPosition?: Point | null
}

export interface YaMapUserLocationMarkerHandle {
	setAccuracy: (accuracy: number | null) => void
	setMarkerPosition: (point: Point | null, options?: SmoothMarkerPositionInput) => number | null
	setMarkerHeading: (heading: number | null, durationInSeconds?: number) => void
}

const YaMapUserLocationMarker = forwardRef<YaMapUserLocationMarkerHandle, IProps>((props, ref) => {
	const initialPoint = props.initialPosition
	const markerRef = useRef<MarkerRef>(null)
	const accuracyRef = useRef<YaMapAccuracyCircleHandle>(null)
	const lastTargetRef = useRef<Point | null>(initialPoint ? { lat: initialPoint.lat, lon: initialPoint.lon } : null)
	const lastTimestampRef = useRef<number | null>(null)
	const lastReceivedAtRef = useRef<number | null>(null)
	const pendingPositionRef = useRef<{ point: Point; options?: SmoothMarkerPositionInput } | null>(null)

	const animatedMoveTo = useCallback((point: Point | null, options?: SmoothMarkerPositionInput) => {
		if (!point) return 0
		if (!markerRef.current) {
			pendingPositionRef.current = { point, options }
			return 0
		}
		if (
			typeof options === 'object' &&
			typeof options.timestamp === 'number' &&
			typeof lastTimestampRef.current === 'number' &&
			options.timestamp <= lastTimestampRef.current
		) {
			return null
		}

		const now = Date.now()
		const durationInMs = getSmoothMarkerMoveDurationMs({
			from: lastTargetRef.current,
			to: point,
			input: options,
			lastReceivedAt: lastReceivedAtRef.current,
			lastTimestamp: lastTimestampRef.current,
			now
		})

		lastTargetRef.current = point
		lastReceivedAtRef.current = now
		if (typeof options === 'object' && typeof options.timestamp === 'number') {
			lastTimestampRef.current = options.timestamp
		}

		markerRef.current.animatedMoveTo(point, durationInMs)
		accuracyRef.current?.setCircleCenter(point, durationInMs)

		return durationInMs
	}, [])

	const animatedRotateTo = useCallback((angle: number | null, durationInMs: number = 250) => {
		if (!markerRef.current || angle === null) return
		markerRef.current.animatedRotateTo(angle, durationInMs)
	}, [])

	const handleSetAccuracy = useCallback((accuracy: number | null) => {
		accuracyRef.current?.setAccuracy(accuracy)
	}, [])

	const handleSetMarkerPosition = useCallback(
		(point: Point | null, options?: SmoothMarkerPositionInput) => {
			return animatedMoveTo(point, options)
		},
		[animatedMoveTo]
	)

	const handleSetMarkerHeading = useCallback(
		(heading: number | null, durationInMs?: number) => {
			animatedRotateTo(heading, durationInMs)
		},
		[animatedRotateTo]
	)

	useImperativeHandle(
		ref,
		() => ({
			setAccuracy: handleSetAccuracy,
			setMarkerPosition: handleSetMarkerPosition,
			setMarkerHeading: handleSetMarkerHeading
		}),
		[handleSetAccuracy, handleSetMarkerPosition, handleSetMarkerHeading]
	)

	useEffect(() => {
		const pendingPosition = pendingPositionRef.current
		if (pendingPosition) {
			pendingPositionRef.current = null
			animatedMoveTo(pendingPosition.point, pendingPosition.options)
		}
	}, [animatedMoveTo, initialPoint])

	if (!initialPoint || initialPoint.lat == null || initialPoint.lon == null) return null

	return (
		<>
			<Marker ref={markerRef} point={initialPoint} zIndex={6} rotated={true}>
				<View>
					<UserWithCircleSvg heading={0} color={props.color} />
				</View>
			</Marker>

			<YaMapAccuracyCircle
				ref={accuracyRef}
				initialPosition={initialPoint}
				debugAccuracyM={props.debugAccuracyM}
				color={props.color}
			/>
		</>
	)
})

YaMapUserLocationMarker.displayName = 'YaMapUserLocationMarker'

export default React.memo(
	YaMapUserLocationMarker,
	(prev, next) =>
		prev.triangleScale === next.triangleScale &&
		prev.initialPosition?.lat === next.initialPosition?.lat &&
		prev.initialPosition?.lon === next.initialPosition?.lon &&
		prev.color === next.color
)
