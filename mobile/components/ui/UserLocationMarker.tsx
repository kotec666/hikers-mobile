import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState, useCallback } from 'react'
import { Marker, MarkerRef, Point, Circle } from 'react-native-yamap-plus'
import { Animated, Easing, View } from 'react-native'
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
	hideCircle: (hidden: boolean) => void
	setCircleCenter: (center: Point | null) => void
	setAccuracy: (accuracy: number | null) => void
}

const MAX_OPACITY = 0.5

const AccuracyCircle = forwardRef<AccuracyCircleHandle, IAccuracyProps>((props, ref) => {
	const pulseAnim = useRef(new Animated.Value(0)).current
	const nextAccuracy = useRef<number | null>(null)
	const circleCenterRef = useRef<ILatLng | undefined | null>(null)
	const [opacity, setOpacity] = useState(MAX_OPACITY)
	const [radius, setRadius] = useState(0)
	const [currentAccuracy, setCurrentAccuracy] = useState(0)
	const [isCircleHidden, setIsCircleHidden] = useState(false)

	useImperativeHandle(ref, () => ({
		setCircleCenter: (center) => {
			circleCenterRef.current = center
		},
		hideCircle: (hidden) => {
			setIsCircleHidden(hidden)
		},
		setAccuracy: (accuracy) => {
			if (accuracy !== currentAccuracy) {
				nextAccuracy.current = accuracy ?? 0
			}
		}
	}))

	useEffect(() => {
		let isCancelled = false

		const animate = () => {
			pulseAnim.setValue(0)
			Animated.timing(pulseAnim, {
				toValue: 1,
				duration: 2000,
				easing: Easing.out(Easing.ease),
				useNativeDriver: false
			}).start(({ finished }) => {
				if (finished && !isCancelled) {
					if (nextAccuracy.current !== null) {
						setCurrentAccuracy(nextAccuracy.current)
						nextAccuracy.current = null
					}
					animate()
				}
			})
		}

		const listenerId = pulseAnim.addListener(({ value }) => {
			if (!currentAccuracy) return
			const r = currentAccuracy * value
			const o = MAX_OPACITY * (1 - value)
			setRadius(r)
			setOpacity(o)
		})

		animate()

		return () => {
			isCancelled = true
			pulseAnim.removeListener(listenerId)
			pulseAnim.stopAnimation()
		}
	}, [currentAccuracy, pulseAnim])

	if (radius > 0.3 && circleCenterRef.current && !isCircleHidden) {
		console.log('render UserLocationMarker >>> Circle', radius)
		return (
			<Circle
				center={circleCenterRef.current}
				radius={radius}
				fillColor={`rgba(0,200,100,${opacity})`}
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
