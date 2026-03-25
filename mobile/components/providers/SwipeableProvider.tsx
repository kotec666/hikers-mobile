import React, { PropsWithChildren, useState } from 'react'
import { useWindowDimensions, LayoutChangeEvent } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { scheduleOnRN } from 'react-native-worklets'

type SwipeableProps = PropsWithChildren<{
	// backgroundColor?: string
	onSwiped: () => void
}>

const SwipeableProvider: React.FC<SwipeableProps> = ({ children, onSwiped /*backgroundColor = '#EC255A'*/ }) => {
	const { width: screenWidth } = useWindowDimensions()

	const startX = useSharedValue(0)
	const translateX = useSharedValue(0)
	const height = useSharedValue(0)

	const [loaded, setLoaded] = useState(false)

	const gesture = Gesture.Pan()
		.onStart(() => {
			startX.value = translateX.value
		})
		.onUpdate((event) => {
			translateX.value = startX.value + event.translationX
		})
		.onEnd(() => {
			if (translateX.value > 100) {
				// вправо
				translateX.value = withTiming(screenWidth, {}, () => {
					height.value = withTiming(0, {}, () => {
						scheduleOnRN(onSwiped)
					})
				})
			} else if (translateX.value < -100) {
				// влево
				translateX.value = withTiming(-screenWidth, {}, () => {
					height.value = withTiming(0, {}, () => {
						scheduleOnRN(onSwiped)
					})
				})
			} else {
				// возврат
				translateX.value = withSpring(0)
			}
		})
		.activeOffsetX([-5, 5])
		.failOffsetY([-5, 5])

	const animatedStyle = useAnimatedStyle(() => ({
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
				style={[loaded ? animatedHeight : { height: 'auto' } /*, { backgroundColor }*/]}
				onLayout={handleLayout}
			>
				<Animated.View style={animatedStyle}>{children}</Animated.View>
			</Animated.View>
		</GestureDetector>
	)
}

export default SwipeableProvider
