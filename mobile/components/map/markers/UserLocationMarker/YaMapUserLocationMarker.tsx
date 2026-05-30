import React, { forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react'
import { Marker, MarkerRef, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'
import YaMapAccuracyCircle, {
	YaMapAccuracyCircleHandle
} from '@/components/map/markers/UserLocationMarker/YaMapAccuracyCircle'

interface IProps {
	color?: string
	triangleScale?: number
	debugAccuracyM?: number
	initialPosition?: Point | null
}

export interface YaMapUserLocationMarkerHandle {
	setAccuracy: (accuracy: number | null) => void
	setMarkerPosition: (point: Point | null, durationInMs?: number) => void
	setMarkerHeading: (heading: number | null, durationInSeconds?: number) => void
}

const YaMapUserLocationMarker = forwardRef<YaMapUserLocationMarkerHandle, IProps>((props, ref) => {
	const initialPoint = props.initialPosition
	const markerRef = useRef<MarkerRef>(null)
	const accuracyRef = useRef<YaMapAccuracyCircleHandle>(null)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	const animatedMoveTo = useCallback((point: Point | null, durationInMs: number = 1500) => {
		if (!markerRef.current || !point) return

		accuracyRef.current?.hideCircle(true)
		if (timeoutRef.current) clearTimeout(timeoutRef.current)

		markerRef.current.animatedMoveTo(point, durationInMs)
		timeoutRef.current = setTimeout(() => {
			accuracyRef.current?.setCircleCenter(point)
			accuracyRef.current?.hideCircle(false)
		}, durationInMs)
	}, [])

	const animatedRotateTo = useCallback((angle: number | null, durationInMs: number = 250) => {
		if (!markerRef.current || angle === null) return
		markerRef.current.animatedRotateTo(angle, durationInMs)
	}, [])

	const handleSetAccuracy = useCallback((accuracy: number | null) => {
		accuracyRef.current?.setAccuracy(accuracy)
	}, [])

	const handleSetMarkerPosition = useCallback(
		(point: Point | null, durationInMs?: number) => {
			animatedMoveTo(point, durationInMs)
			accuracyRef.current?.setCircleCenter(point)
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
		return () => {
			if (timeoutRef.current) clearTimeout(timeoutRef.current)
		}
	}, [])

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
