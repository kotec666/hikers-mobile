import React, { useEffect, useRef, useState } from 'react'
import { Marker, Circle } from 'react-native-yamap-plus-lite'
import { Animated, Easing, View } from 'react-native'
import UserWithCircleSvg from '@/components/svg/UserWithCircleSvg'
import { ILatLng } from '@/components/map/MapComponent'

interface Props {
	position?: ILatLng | null
	accuracy?: number | null
	heading?: number
	triangleScale?: number
}

const MAX_OPACITY = 0.5

const UserLocationMarker = ({ position, heading, accuracy = 0 }: Props) => {
	const pulseAnim = useRef(new Animated.Value(0)).current
	const [radius, setRadius] = useState(0)
	const [opacity, setOpacity] = useState(MAX_OPACITY)
	const [currentAccuracy, setCurrentAccuracy] = useState(accuracy)
	const nextAccuracy = useRef<number | null>(null)

	// Когда приходит новое значение — сохраняем его в очередь
	useEffect(() => {
		if (accuracy !== currentAccuracy) {
			nextAccuracy.current = accuracy ?? 0
		}
	}, [accuracy])

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

	if (!position?.lat || !position?.lon) return null

	return (
		<>
			<Marker point={position} zIndex={6}>
				<View>
					<UserWithCircleSvg heading={heading} key={heading} />
				</View>
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
