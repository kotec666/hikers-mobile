import React, { forwardRef, useImperativeHandle, useRef, useCallback, useEffect } from 'react'
import { Marker, MarkerRef, Point } from 'react-native-yamap-plus'
import { View } from 'react-native'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'
import { ILatLng } from '@/components/map/MapComponent'
import AccuracyCircle, { AccuracyCircleHandle } from '@/components/map/markers/UserLocationMarker/AccuracyCircle'

interface IProps {
	initialPosition: ILatLng
	triangleScale?: number
}

export interface UserLocationMarkerHandle {
	setAccuracy: (accuracy: number | null) => void
	setMarkerPosition: (point: Point | null, durationInMs?: number) => void
	setMarkerHeading: (heading: number | null, durationInSeconds?: number) => void
}

const UserLocationMarker = forwardRef<UserLocationMarkerHandle, IProps>((props, ref) => {
	const initialPoint = useRef(props.initialPosition).current
	const markerRef = useRef<MarkerRef>(null)
	const accuracyRef = useRef<AccuracyCircleHandle>(null)
	const timeoutRef = useRef<NodeJS.Timeout | null>(null)

	const animatedMoveTo = useCallback((point: Point | null, durationInMs: number = 2500) => {
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

	if (!initialPoint?.lat || !initialPoint?.lon) return null

	console.log('render UserLocationMarker')
	return (
		<>
			<Marker ref={markerRef} point={initialPoint} zIndex={6} rotated={true}>
				<View>
					<UserWithCircleSvg heading={0} />
				</View>
			</Marker>

			<AccuracyCircle initialPosition={initialPoint} ref={accuracyRef} />
		</>
	)
})

UserLocationMarker.displayName = 'UserLocationMarker'

export default React.memo(
	UserLocationMarker,
	(prev, next) =>
		prev.triangleScale === next.triangleScale &&
		prev.initialPosition.lat === next.initialPosition.lat &&
		prev.initialPosition.lon === next.initialPosition.lon
)
