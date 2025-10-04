import React, { useEffect, useRef, useState } from 'react'
import { Marker, Circle } from 'react-native-yamap-plus-lite'
import { Animated, Easing } from 'react-native'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'

interface Props {
	position: { lat: number; lon: number }
	accuracy?: number
	heading?: number
}

const MAX_OPACITY = 0.5 // начальная видимость круга

const UserLocationMarker = ({ position, accuracy = 10 }: Props) => {
	const pulseAnim = useRef(new Animated.Value(0)).current
	const [radius, setRadius] = useState(0)
	const [opacity, setOpacity] = useState(MAX_OPACITY)

	useEffect(() => {
		// при смене accuracy сбрасываем видимые значения
		setRadius(0)
		setOpacity(MAX_OPACITY)
		pulseAnim.setValue(0)

		const seq = Animated.loop(
			Animated.sequence([
				Animated.timing(pulseAnim, {
					toValue: 1,
					duration: 2000,
					easing: Easing.out(Easing.ease),
					useNativeDriver: false
				}),
				// мгновенный сброс в 0 — чтобы при старте следующего цикла radius был 0
				Animated.timing(pulseAnim, {
					toValue: 0,
					duration: 0,
					useNativeDriver: false
				})
			])
		)

		// Подписываемся на обновления значения анимации
		const listenerId = pulseAnim.addListener(({ value }) => {
			// radius: 0 -> accuracy
			const r = accuracy * value
			// opacity: MAX_OPACITY -> 0 (чем больше радиус — тем менее виден)
			const o = MAX_OPACITY * (1 - value)

			setRadius(r)
			setOpacity(o)
		})

		seq.start()

		return () => {
			seq.stop()
			pulseAnim.removeListener(listenerId)
			pulseAnim.setValue(0)
		}
	}, [accuracy, pulseAnim])

	if (!position?.lat || !position?.lon) return null
	return (
		<>
			<Marker point={position} zIndex={6}>
				<UserWithCircleSvg />
			</Marker>

			{radius > 0.3 && (
				<Circle
					center={position}
					radius={radius}
					fillColor={`rgba(0,200,100,${opacity})`}
					strokeColor={'transparent'}
					strokeWidth={0}
					zIndex={5}
				/>
			)}
		</>
	)
}

export default UserLocationMarker
