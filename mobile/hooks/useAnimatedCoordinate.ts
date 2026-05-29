import { useCallback } from 'react'
import { Circle, Marker, LatLng, MapCircleProps, MapMarkerProps } from 'react-native-maps'
import Animated, {
	cancelAnimation,
	Easing,
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

type AnimateBaseOptions = {
	durationMs?: number
	onFinish?: () => void
}

type AnimatePositionOptions = {} & LatLng & AnimateBaseOptions
type AnimateHeadingOptions = {
	heading: number
} & AnimateBaseOptions

const shortestAngle = (from: number, to: number) => {
	const delta = ((to - from + 540) % 360) - 180
	return from + delta
}

export const AnimatedMarker = Animated.createAnimatedComponent(Marker)
export const AnimatedCircle = Animated.createAnimatedComponent(Circle)

export const useAnimatedCoordinate = (initialPosition: LatLng) => {
	const coords = useSharedValue({
		latitude: initialPosition.latitude,
		longitude: initialPosition.longitude
	})
	const rotation = useSharedValue(0)

	const markerAnimatedProps = useAnimatedProps(() => {
		return {
			coordinate: coords.value
		} as Partial<MapMarkerProps>
	})

	const circleAnimatedProps = useAnimatedProps(() => {
		return {
			center: coords.value
		} as Partial<MapCircleProps>
	})

	const rotationStyle = useAnimatedStyle(() => {
		return {
			transform: [
				{
					rotate: `${rotation.value}deg`
				}
			]
		}
	})

	const animatePosition = useCallback(
		({ latitude, longitude, durationMs = 500, onFinish }: AnimatePositionOptions) => {
			cancelAnimation(coords)

			coords.value = withTiming(
				{ latitude, longitude },
				{
					duration: durationMs,
					easing: Easing.inOut(Easing.cubic)
				},
				(finished) => {
					if (finished && onFinish) {
						scheduleOnRN(onFinish)
					}
				}
			)
		},
		[coords]
	)

	const animateHeading = useCallback(
		({ heading, durationMs = 500, onFinish }: AnimateHeadingOptions) => {
			cancelAnimation(rotation)

			const from = rotation.value
			const target = shortestAngle(from, heading)

			rotation.value = withTiming(
				target,
				{
					duration: durationMs,
					easing: Easing.inOut(Easing.cubic)
				},
				(finished) => {
					if (finished && onFinish) {
						scheduleOnRN(onFinish)
					}
				}
			)
		},
		[rotation]
	)

	return {
		animatePosition,
		animateHeading,
		markerAnimatedProps,
		circleAnimatedProps,
		rotationStyle
	}
}
