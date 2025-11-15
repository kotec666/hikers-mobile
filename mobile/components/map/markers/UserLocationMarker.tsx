import React, { forwardRef, useImperativeHandle, useRef, useState, useCallback } from 'react'
import { Marker, MarkerRef, Point, Circle } from 'react-native-yamap-plus'
import { View } from 'react-native'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'
import { ILatLng } from '@/components/map/MapComponent'

interface IProps {
	initialPosition: ILatLng
	triangleScale?: number
}

interface IAccuracyProps {}

export interface UserLocationMarkerHandle {
	setAccuracy: (accuracy: number | null) => void
	setMarkerPosition: (point: Point | null, durationInMs?: number) => void
	setMarkerHeading: (heading: number | null, durationInSeconds?: number) => void
}

export interface AccuracyCircleHandle {
	setCircleCenter: (center: Point | null) => void
	hideCircle: (hidden: boolean) => void
	setAccuracy: (accuracy: number | null) => void
}

const AccuracyCircle = forwardRef<AccuracyCircleHandle, IAccuracyProps>((props, ref) => {
	const [state, setState] = useState<{
		center: Point | null
		radius: number
		isCircleHidden: boolean
	}>({
		center: null,
		radius: 0,
		isCircleHidden: false
	})

	useImperativeHandle(ref, () => ({
		setCircleCenter: (center) => {
			setState((s) => ({ ...s, center: center }))
		},
		hideCircle: (hidden) => {
			setState((s) => ({ ...s, isCircleHidden: hidden }))
		},
		setAccuracy: (accuracy) => {
			if (accuracy !== state.radius) {
				setState((s) => ({ ...s, radius: accuracy ?? 0 }))
			}
		}
	}))

	if (state.radius > 0.3 && state.center && !state.isCircleHidden) {
		return (
			<Circle
				center={state.center}
				radius={state.radius}
				fillColor={`rgba(0,200,100,0.2)`}
				strokeColor="transparent"
				strokeWidth={0}
				zIndex={5}
			/>
		)
	}
})

AccuracyCircle.displayName = 'AccuracyCircle'

const UserLocationMarker = forwardRef<UserLocationMarkerHandle, IProps>((props, ref) => {
	const initialPoint = useRef(props.initialPosition).current
	const markerRef = useRef<MarkerRef>(null)
	const accuracyRef = useRef<AccuracyCircleHandle>(null)

	useImperativeHandle(ref, () => ({
		setAccuracy: (accuracy) => {
			if (accuracyRef.current) {
				accuracyRef.current.setAccuracy(accuracy)
			}
		},
		setMarkerPosition: (point: Point | null, durationInMs?: number) => {
			animatedMoveTo(point, durationInMs)
			if (accuracyRef.current) {
				accuracyRef.current.setCircleCenter(point)
			}
		},
		setMarkerHeading: (heading: number | null, durationInMs?: number) => {
			animatedRotateTo(heading, durationInMs)
		}
	}))

	const animatedMoveTo = useCallback((point: Point | null, durationInMs: number = 1500) => {
		if (!markerRef.current || !point) return
		if (accuracyRef.current) {
			accuracyRef.current.hideCircle(true)
		}

		markerRef.current.animatedMoveTo(point, durationInMs)
		setTimeout(() => {
			if (accuracyRef.current) {
				accuracyRef.current.hideCircle(false)
			}
		}, durationInMs)
	}, [])

	const animatedRotateTo = useCallback((angle: number | null, durationInMs: number = 250) => {
		if (!markerRef.current || angle === null) return
		markerRef.current.animatedRotateTo(angle, durationInMs)
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

			<AccuracyCircle ref={accuracyRef} />
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
