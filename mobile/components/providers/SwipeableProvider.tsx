import React, { PropsWithChildren, useState } from 'react'
import { useWindowDimensions, LayoutChangeEvent, View, Pressable } from 'react-native'
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
	onSwiped?: () => void
	onActionPress?: () => void
	cardBackgroundColor: string
	variant?: 'dismiss' | 'action'
	actionWidth?: number
	bottomSpacing?: number
}>

const SwipeableProvider: React.FC<SwipeableProps> = ({
	children,
	onSwiped,
	onActionPress,
	cardBackgroundColor,
	variant = 'dismiss',
	actionWidth = 64,
	bottomSpacing = 0
}) => {
	const { width: screenWidth } = useWindowDimensions()
	const isActionVariant = variant === 'action'

	const startX = useSharedValue(0)
	const translateX = useSharedValue(0)
	const height = useSharedValue(0)
	const swipeProgress = useSharedValue(0)

	const [loaded, setLoaded] = useState(false)
	const [actionVisible, setActionVisible] = useState(false)

	const gesture = Gesture.Pan()
		.onStart(() => {
			startX.value = translateX.value
		})
		.onUpdate((event) => {
			const nextTranslateX = startX.value + event.translationX
			translateX.value = isActionVariant ? Math.min(Math.max(nextTranslateX, -actionWidth), 0) : nextTranslateX
			swipeProgress.value = Math.min(Math.abs(translateX.value) / (isActionVariant ? actionWidth : 100), 1)
		})
		.onEnd((event) => {
			const velocity = event.velocityX
			if (isActionVariant) {
				if (translateX.value < -actionWidth / 2 || velocity < -600) {
					translateX.value = withSpring(-actionWidth)
					swipeProgress.value = withTiming(1)
					scheduleOnRN(setActionVisible, true)
				} else {
					translateX.value = withSpring(0)
					swipeProgress.value = withTiming(0)
					scheduleOnRN(setActionVisible, false)
				}
				return
			}

			if (translateX.value > 100 || velocity > 600) {
				translateX.value = withTiming(screenWidth, {}, () => {
					height.value = withTiming(0, {}, () => {
						if (onSwiped) scheduleOnRN(onSwiped)
					})
				})
			} else if (translateX.value < -100 || velocity < -600) {
				translateX.value = withTiming(-screenWidth, {}, () => {
					height.value = withTiming(0, {}, () => {
						if (onSwiped) scheduleOnRN(onSwiped)
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
		backgroundColor: isActionVariant
			? cardBackgroundColor
			: interpolateColor(swipeProgress.value, [0, 1], [cardBackgroundColor, 'rgba(255,69,58,0.8)'])
	}))

	const animatedCardStyle = useAnimatedStyle(() => ({
		backgroundColor: cardBackgroundColor,
		transform: [{ translateX: translateX.value }]
	}))

	const animatedActionStyle = useAnimatedStyle(() => ({
		backgroundColor: interpolateColor(swipeProgress.value, [0, 1], [cardBackgroundColor, 'rgba(255,69,58,0.8)'])
	}))

	const animatedHeight = useAnimatedStyle(() => ({
		height: height.value
	}))

	const handleLayout = (e: LayoutChangeEvent) => {
		if (!loaded) {
			height.value = e.nativeEvent.layout.height + bottomSpacing
			setLoaded(true)
		}
	}

	const handleActionPress = () => {
		if (!onActionPress) return

		setActionVisible(false)
		translateX.value = withTiming(-screenWidth, {}, () => {
			height.value = withTiming(0, {}, () => {
				scheduleOnRN(onActionPress)
			})
		})
	}

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View
				style={[loaded ? animatedHeight : { height: 'auto' }, animatedContainerStyle]}
				className="overflow-hidden"
				onLayout={isActionVariant ? undefined : handleLayout}
			>
				{isActionVariant ? (
					<Animated.View
						className="absolute bottom-0 right-0 top-0 items-center justify-center"
						style={[{ width: actionWidth, bottom: bottomSpacing }, animatedActionStyle]}
					>
						<DeleteTrashSvg />
					</Animated.View>
				) : (
					<View className="absolute inset-0 justify-center items-end pr-5">
						<DeleteTrashSvg />
					</View>
				)}
				<Animated.View style={[animatedCardStyle]} className={isActionVariant ? undefined : 'h-full'}>
					{isActionVariant ? <View onLayout={handleLayout}>{children}</View> : children}
				</Animated.View>
				{isActionVariant && actionVisible ? (
					<Pressable
						className="absolute bottom-0 right-0 top-0 items-center justify-center"
						style={{ width: actionWidth, bottom: bottomSpacing }}
						onPress={handleActionPress}
						disabled={!onActionPress}
					/>
				) : null}
				{bottomSpacing ? <View style={{ height: bottomSpacing }} /> : null}
			</Animated.View>
		</GestureDetector>
	)
}

export default SwipeableProvider
