import React, { PropsWithChildren, useState } from 'react'
import { useWindowDimensions, LayoutChangeEvent, View } from 'react-native'
import Animated, {
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
	interpolateColor
} from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { scheduleOnRN } from 'react-native-worklets'
import DeleteTrashSvg from '@/components/svg/DeleteTrashSvg'

type SwipeableProps = PropsWithChildren<{
	onSwiped: () => void
	cardBackgroundColor: string
}>

const SwipeableProvider: React.FC<SwipeableProps> = ({ children, onSwiped, cardBackgroundColor }) => {
	const { width: screenWidth } = useWindowDimensions()

	const startX = useSharedValue(0)
	const translateX = useSharedValue(0)
	const height = useSharedValue(0)
	const swipeProgress = useSharedValue(0)

	const [loaded, setLoaded] = useState(false)

	const gesture = Gesture.Pan()
		.onStart(() => {
			startX.value = translateX.value
		})
		.onUpdate((event) => {
			translateX.value = startX.value + event.translationX
			swipeProgress.value = Math.min(Math.abs(translateX.value) / 100, 1)
		})
		.onEnd((event) => {
			const velocity = event.velocityX
			if (translateX.value > 100 || velocity > 600) {
				translateX.value = withTiming(screenWidth, {}, () => {
					height.value = withTiming(0, {}, () => {
						scheduleOnRN(onSwiped)
					})
				})
			} else if (translateX.value < -100 || velocity < -600) {
				translateX.value = withTiming(-screenWidth, {}, () => {
					height.value = withTiming(0, {}, () => {
						scheduleOnRN(onSwiped)
					})
				})
			} else {
				translateX.value = withSpring(0)
				swipeProgress.value = withTiming(0)
			}
		})
		.activeOffsetX([-5, 5])
		.failOffsetY([-5, 5])

	const animatedContainerStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(swipeProgress.value, [0, 1], [cardBackgroundColor, 'rgba(255,69,58,0.8)'])
	}))

	const animatedCardStyle = useAnimatedStyle(() => ({
		transform: [{ translateX: translateX.value }]
	}))

	const animatedHeight = useAnimatedStyle(() => ({
		height: height.value
	}))

	const handleLayout = (e: LayoutChangeEvent) => {
		if (!loaded) {
			height.value = e.nativeEvent.layout.height
			setLoaded(true)
		}
	}

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View
				style={[loaded ? animatedHeight : { height: 'auto' }, animatedContainerStyle]}
				className="overflow-hidden"
				onLayout={handleLayout}
			>
				<View className="absolute inset-0 justify-center items-end pr-5">
					<DeleteTrashSvg />
				</View>
				<Animated.View style={[animatedCardStyle]} className="h-full">
					{children}
				</Animated.View>
			</Animated.View>
		</GestureDetector>
	)
}

export default SwipeableProvider
