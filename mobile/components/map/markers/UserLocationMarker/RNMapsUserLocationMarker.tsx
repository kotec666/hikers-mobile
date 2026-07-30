import React, { forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'
import { AnimatedMarker, useAnimatedCoordinate } from '@/hooks/useAnimatedCoordinate'
import Animated from 'react-native-reanimated'
import { Marker } from 'react-native-maps'
import { View } from 'react-native'
import RNMapsAccuracyCircle, {
	RNMapsAccuracyCircleHandle
} from '@/components/map/markers/UserLocationMarker/RNMapsAccuracyCircle'
import { IPoint } from '@/types/interfaces'
import {
	getSmoothMarkerMoveDurationMs,
	SmoothMarkerPositionInput
} from '@/components/map/markers/UserLocationMarker/smoothMarkerMovement'

interface IProps {
	initialPosition?: {
		lat: number
		lon: number
	} | null
	triangleScale?: number
	color?: string
	debugAccuracyM?: number
	animatedFillProps?: Partial<{ fill: string }>
}

export interface RNMapsUserLocationMarkerHandle {
	setAccuracy: (accuracy: number | null) => void
	setMarkerPosition: (newCoords: IPoint | null, options?: SmoothMarkerPositionInput) => number | null
	setMarkerHeading: (heading: number | null, durationInMs?: number) => void
	setAccuracyCircleColor: (color: string) => void
}

type MarkerRef = React.ComponentRef<typeof Marker>
const RNMapsUserLocationMarker = forwardRef<RNMapsUserLocationMarkerHandle, IProps>((props, ref) => {
	const initialPoint = props.initialPosition
	const markerRef = useRef<MarkerRef>(null)
	const accuracyRef = useRef<RNMapsAccuracyCircleHandle>(null)
	const lastTargetRef = useRef<IPoint | null>(initialPoint ? { lat: initialPoint.lat, lon: initialPoint.lon } : null)
	const lastTimestampRef = useRef<number | null>(null)
	const lastReceivedAtRef = useRef<number | null>(null)
	const pendingPositionRef = useRef<{ point: IPoint; options?: SmoothMarkerPositionInput } | null>(null)
	const animated = useAnimatedCoordinate({
		latitude: initialPoint?.lat || 0,
		longitude: initialPoint?.lon || 0
	})

	const handleSetAccuracy = useCallback((accuracy: number | null) => {
		accuracyRef.current?.setAccuracy(accuracy)
	}, [])

	const handleSetMarkerPosition = useCallback(
		(newCoords: IPoint | null, options?: SmoothMarkerPositionInput) => {
			if (!newCoords) {
				accuracyRef.current?.hideCircle(true)
				return 0
			}
			if (!initialPoint) {
				pendingPositionRef.current = { point: newCoords, options }
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
			const durationMs = getSmoothMarkerMoveDurationMs({
				from: lastTargetRef.current,
				to: newCoords,
				input: options,
				lastReceivedAt: lastReceivedAtRef.current,
				lastTimestamp: lastTimestampRef.current,
				now
			})

			lastTargetRef.current = newCoords
			lastReceivedAtRef.current = now
			if (typeof options === 'object' && typeof options.timestamp === 'number') {
				lastTimestampRef.current = options.timestamp
			}

			animated.animatePosition({
				latitude: newCoords.lat,
				longitude: newCoords.lon,
				durationMs
			})

			return durationMs
		},
		[animated, initialPoint]
	)

	useEffect(() => {
		if (!initialPoint) return
		const pendingPosition = pendingPositionRef.current
		if (!pendingPosition) return

		pendingPositionRef.current = null
		handleSetMarkerPosition(pendingPosition.point, pendingPosition.options)
	}, [handleSetMarkerPosition, initialPoint])

	const handleSetMarkerHeading = useCallback(
		(heading: number | null, durationMs = 500) => {
			if (heading == null) return
			animated.animateHeading({
				heading,
				durationMs
				// onFinish: cb
			})
		},
		[animated]
	)

	useImperativeHandle(
		ref,
		() => ({
			setAccuracy: handleSetAccuracy,
			setMarkerPosition: handleSetMarkerPosition,
			setMarkerHeading: handleSetMarkerHeading,
			setAccuracyCircleColor: (color: string) => {
				accuracyRef?.current?.setColor(color)
			}
		}),
		[handleSetAccuracy, handleSetMarkerPosition, handleSetMarkerHeading]
	)

	if (!initialPoint || initialPoint.lat == null || initialPoint.lon == null) return null

	return (
		<>
			<AnimatedMarker
				ref={markerRef}
				coordinate={{
					latitude: initialPoint.lat,
					longitude: initialPoint.lon
				}}
				animatedProps={animated.markerAnimatedProps}
				style={{
					zIndex: 6
				}}
				tracksViewChanges={false}
			>
				{/* с помощью border задал границы иконки, чтобы при вращении иконка сама не смещалась относительно центра  */}
				<View className="border border-transparent">
					<Animated.View style={animated.rotationStyle}>
						<UserWithCircleSvg
							heading={0}
							color={props.color}
							animatedFillProps={props.animatedFillProps}
						/>
					</Animated.View>
				</View>
			</AnimatedMarker>

			<RNMapsAccuracyCircle
				ref={accuracyRef}
				initialPosition={initialPoint}
				animatedProps={animated.circleAnimatedProps}
				debugAccuracyM={props.debugAccuracyM}
				color={props.color}
			/>
		</>
	)
})

RNMapsUserLocationMarker.displayName = 'RNMapsUserLocationMarker'

export default React.memo(
	RNMapsUserLocationMarker,
	(prev, next) =>
		prev.triangleScale === next.triangleScale &&
		prev.initialPosition?.lat === next.initialPosition?.lat &&
		prev.initialPosition?.lon === next.initialPosition?.lon &&
		prev.color === next.color &&
		prev.animatedFillProps?.fill === next.animatedFillProps?.fill
)
