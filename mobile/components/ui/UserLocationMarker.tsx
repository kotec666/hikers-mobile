import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Marker, MarkerRef, Point } from 'react-native-yamap-plus'
import { Animated, Easing, View, Text } from 'react-native'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'
import { ILatLng } from '@/components/map/MapComponent'

interface IProps {
	initialPosition: ILatLng
	triangleScale?: number
}

export interface UserLocationMarkerHandle {
	setAccuracy: (accuracy: number | null) => void
	// setHeading: (heading: number | null) => void
	setMarkerPosition: (point: Point | null, durationInMs?: number) => void
	setMarkerHeading: (heading: number | null, durationInSeconds?: number) => void
}

const MAX_OPACITY = 0.5

const UserLocationMarker = forwardRef<UserLocationMarkerHandle, IProps>((props, ref) => {
	const initialPoint = useRef(props.initialPosition).current
	const pulseAnim = useRef(new Animated.Value(0)).current
	const oldHeading = useRef<number | null>(null)
	const [animatedHeading, setAnimatedHeading] = useState<number | null>(null)
	const [isHeadingAnimating, setIsHeadingAnimating] = useState(false)
	const [radius, setRadius] = useState(0)
	const [opacity, setOpacity] = useState(MAX_OPACITY)
	const [currentAccuracy, setCurrentAccuracy] = useState(0)
	const nextAccuracy = useRef<number | null>(null)
	const markerRef = useRef<MarkerRef>(null)

	useImperativeHandle(ref, () => ({
		setAccuracy: (accuracy) => {
			if (accuracy !== currentAccuracy) {
				nextAccuracy.current = accuracy ?? 0
			}
		},
		// setHeading: (heading) => {
		// 	if (oldHeading.current === null && typeof heading === 'number') {
		// 		oldHeading.current = heading
		// 		setAnimatedHeading(heading)
		// 		return
		// 	}
		//
		// 	animateHeading(heading, 300)
		// },
		setMarkerPosition: (point: Point | null, durationInMs?: number) => animatedMoveTo(point, durationInMs),
		setMarkerHeading: (heading: number | null, durationInSeconds?: number) =>
			animatedRotateTo(heading, durationInSeconds)
	}))

	const animatedMoveTo = (point: Point | null, durationInMs: number = 1500) => {
		if (!markerRef.current) return
		if (!point) return

		markerRef.current.animatedMoveTo(point, durationInMs)
	}

	const animatedRotateTo = (angle: number | null, durationInMs: number = 250) => {
		if (!markerRef.current) return
		if (angle === null) return

		markerRef.current.animatedRotateTo(angle, durationInMs)
	}

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
					// Если есть новое accuracy — применяем его после цикла
					if (nextAccuracy.current !== null) {
						setCurrentAccuracy(nextAccuracy.current)
						nextAccuracy.current = null
					}
					// Перезапускаем следующий цикл
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

	if (!initialPoint?.lat || !initialPoint?.lon) return null
	return (
		<>
			<Marker ref={markerRef} point={initialPoint} zIndex={6} rotated={true}>
				<View>
					<UserWithCircleSvg heading={0} />
				</View>
				{currentAccuracy > 0 && (
					<Animated.View
						style={{
							position: 'absolute',
							width: radius * 2,
							height: radius * 2,
							borderRadius: radius,
							backgroundColor: `rgba(0, 200, 100, ${opacity})`,
							transform: [{ translateX: -radius }, { translateY: -radius }]
						}}
					/>
				)}
			</Marker>

			{/*{radius > 0.3 && (*/}
			{/*	<Circle*/}
			{/*		center={initialPoint}*/}
			{/*		radius={radius}*/}
			{/*		fillColor={`rgba(0,200,100,${opacity})`}*/}
			{/*		strokeColor={'transparent'}*/}
			{/*		strokeWidth={0}*/}
			{/*		zIndex={5}*/}
			{/*	/>*/}
			{/*)}*/}
		</>
	)
})

UserLocationMarker.displayName = 'UserLocationMarker'

export default UserLocationMarker
