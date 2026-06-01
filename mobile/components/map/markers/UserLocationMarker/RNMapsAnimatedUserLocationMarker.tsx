import React, { forwardRef, useImperativeHandle, useRef, useCallback } from 'react'
import { AnimatedMarker, useAnimatedCoordinate } from '@/hooks/useAnimatedCoordinate'
import Animated from 'react-native-reanimated'
import { Marker } from 'react-native-maps'
import { View } from 'react-native'
import { IPoint } from '@/types/interfaces'
import AnimatedUserWithCircleSvg from '@/components/svg/AnimatedUserWithCircleSvg'
import RNMapsAnimatedAccuracyCircle from '@/components/map/markers/UserLocationMarker/RNMapsAnimatedAccuracyCircle'
import { RNMapsAccuracyCircleHandle } from '@/components/map/markers/UserLocationMarker/RNMapsAccuracyCircle'

interface IProps {
	initialPosition?: {
		lat: number
		lon: number
	} | null
	triangleScale?: number
	color?: string
	debugAccuracyM?: number
	animatedFillProps?: Partial<{ fill: string }>
	animatedFillColorWithOpacityProps?: Partial<{ fillColor: string }>
}

export interface RNMapsUserLocationMarkerHandle {
	setAccuracy: (accuracy: number | null) => void
	setMarkerPosition: (newCoords: IPoint | null, durationInMs?: number) => void
	setMarkerHeading: (heading: number | null, durationInMs?: number) => void
}

type MarkerRef = React.ComponentRef<typeof Marker>
const RNMapsAnimatedUserLocationMarker = forwardRef<RNMapsUserLocationMarkerHandle, IProps>((props, ref) => {
	const initialPoint = props.initialPosition
	const markerRef = useRef<MarkerRef>(null)
	const accuracyRef = useRef<RNMapsAccuracyCircleHandle>(null)
	const animated = useAnimatedCoordinate({
		latitude: initialPoint?.lat || 0,
		longitude: initialPoint?.lon || 0
	})

	const handleSetAccuracy = useCallback((accuracy: number | null) => {
		accuracyRef.current?.setAccuracy(accuracy)
	}, [])

	const handleSetMarkerPosition = useCallback(
		(newCoords: IPoint | null, durationMs = 500) => {
			accuracyRef.current?.setCircleCenter(newCoords)
			accuracyRef.current?.hideCircle(true)
			if (!newCoords) return
			animated.animatePosition({
				latitude: newCoords.lat,
				longitude: newCoords.lon,
				durationMs,
				onFinish: () => accuracyRef.current?.hideCircle(false)
			})
		},
		[animated]
	)

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
			setMarkerHeading: handleSetMarkerHeading
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
						<AnimatedUserWithCircleSvg
							heading={0}
							color={props.color}
							animatedFillProps={props.animatedFillProps}
						/>
					</Animated.View>
				</View>
			</AnimatedMarker>

			<RNMapsAnimatedAccuracyCircle
				ref={accuracyRef}
				initialPosition={initialPoint}
				debugAccuracyM={props.debugAccuracyM}
				color={props.color}
				animatedFillColorWithOpacityProps={props.animatedFillColorWithOpacityProps}
			/>
		</>
	)
})

RNMapsAnimatedUserLocationMarker.displayName = 'RNMapsUserLocationMarker'

export default React.memo(
	RNMapsAnimatedUserLocationMarker,
	(prev, next) =>
		prev.triangleScale === next.triangleScale &&
		prev.initialPosition?.lat === next.initialPosition?.lat &&
		prev.initialPosition?.lon === next.initialPosition?.lon &&
		prev.color === next.color
)
