import { BlurView } from 'expo-blur'
import { Image } from 'expo-image'
import React, { useCallback, useEffect, useState } from 'react'
import { Dimensions, Text, TouchableOpacity, View, StyleSheet, StyleProp, ViewStyle, Platform } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming,
	useAnimatedRef
} from 'react-native-reanimated'
import Portal from '@/components/Portal/Portal'
import { scheduleOnRN } from 'react-native-worklets'
import PeopleSvg from '@/components/svg/PeopleSvg'
import { cn } from '@/helpers/cn'
import { useBlurContext } from '@/components/providers/BlurProvider'

const SPRING_CONFIG = { damping: 15, mass: 1, stiffness: 200 }
const OPEN_HORIZONTAL_PADDING = 24
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('screen')

interface Props {
	size?: number
	imageUrl?: string | null
	bordered?: boolean
}

const DummyAvatar = ({
	bordered,
	style,
	className,
	size
}: {
	bordered?: boolean
	style?: StyleProp<ViewStyle>
	className?: string
	size: number
}) => {
	return (
		<View
			className={cn('relative justify-center items-center bg-blue-98 w-full h-full', className, {
				'border-[1px] border-white/20': bordered
			})}
			style={[style, { borderRadius: 999 }]}
		>
			<PeopleSvg height={size} width={size} />
		</View>
	)
}

export const AnimatedProfilePicture = ({ size = 40, imageUrl, bordered }: Props) => {
	const blurTargetRef = useBlurContext()

	const [imageError, setImageError] = useState(false)

	useEffect(() => {
		setImageError(false)
	}, [imageUrl])

	const isOpen = useSharedValue(false)

	const translateX = useSharedValue(0)
	const translateY = useSharedValue(0)
	const scale = useSharedValue(1)

	const backdropOpacity = useSharedValue(0)
	const closeButtonOpacity = useSharedValue(0)

	const originX = useSharedValue(0)
	const originY = useSharedValue(0)

	const distanceToCenterX = useSharedValue(0)
	const distanceToCenterY = useSharedValue(0)

	const containerRef = useAnimatedRef<View>()
	const [isPortalVisible, setIsPortalVisible] = useState(false)

	const screenCenterX = SCREEN_WIDTH / 2
	const screenCenterY = SCREEN_HEIGHT / 2

	const AVAILABLE_WIDTH = SCREEN_WIDTH - OPEN_HORIZONTAL_PADDING * 2
	const MAX_SCALE = Math.min(AVAILABLE_WIDTH / size, SCREEN_HEIGHT / size)

	const hasImage =
		typeof imageUrl === 'string' && !imageUrl.includes('undefined') && !imageUrl.includes('null') && !imageError

	const resetValues = useCallback(() => {
		isOpen.value = false

		translateX.value = withSpring(0, SPRING_CONFIG)
		translateY.value = withSpring(0, SPRING_CONFIG)
		scale.value = withSpring(1, SPRING_CONFIG)

		backdropOpacity.value = withTiming(0, { duration: 300 })
		closeButtonOpacity.value = withTiming(0, { duration: 200 })

		scheduleOnRN(() => setIsPortalVisible(false))
	}, [])

	/**
	 * Измерение позиции и запуск анимации
	 * ВСЁ происходит внутри measure callback
	 */
	const measureAndOpen = () => {
		'worklet'
		containerRef.current?.measure((x, y) => {
			originX.value = x
			originY.value = y

			const dx = screenCenterX - (x + size / 2)
			const dy = screenCenterY - (y + size / 2)

			distanceToCenterX.value = dx
			distanceToCenterY.value = dy

			translateX.value = withSpring(dx, SPRING_CONFIG)
			translateY.value = withSpring(dy, SPRING_CONFIG)
			scale.value = withSpring(MAX_SCALE, SPRING_CONFIG)

			backdropOpacity.value = withTiming(1, { duration: 300 })
			closeButtonOpacity.value = withTiming(1, { duration: 300 })
		})
	}

	const openImageJS = () => {
		isOpen.value = true
		setIsPortalVisible(true)
		measureAndOpen()
	}

	const panGesture = Gesture.Pan()
		.onStart(() => {
			translateX.value = distanceToCenterX.value
			translateY.value = distanceToCenterY.value
			closeButtonOpacity.value = withTiming(0, { duration: 200 })
		})
		.onUpdate((event) => {
			translateX.value = distanceToCenterX.value + event.translationX
			translateY.value = distanceToCenterY.value + event.translationY

			const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2)

			scale.value = interpolate(distance, [0, 300], [MAX_SCALE, MAX_SCALE * 0.85], Extrapolation.CLAMP)

			backdropOpacity.value = interpolate(distance, [0, 200], [1, 0], Extrapolation.CLAMP)
		})
		.onEnd((event) => {
			const velocity = Math.sqrt(event.velocityX ** 2 + event.velocityY ** 2)
			const distance = Math.sqrt(event.translationX ** 2 + event.translationY ** 2)

			if (distance > 150 || velocity > 800) {
				scheduleOnRN(resetValues)
			} else {
				translateX.value = withSpring(distanceToCenterX.value, SPRING_CONFIG)
				translateY.value = withSpring(distanceToCenterY.value, SPRING_CONFIG)
				scale.value = withSpring(MAX_SCALE, SPRING_CONFIG)
				backdropOpacity.value = withTiming(1, { duration: 300 })
				closeButtonOpacity.value = withTiming(1, { duration: 300 })
			}
		})

	const tapGesture = Gesture.Tap().onStart(() => {
		if (!isOpen.value) {
			scheduleOnRN(openImageJS)
		} else {
			scheduleOnRN(resetValues)
		}
	})

	const backdropTapGesture = Gesture.Tap().onStart(() => {
		scheduleOnRN(resetValues)
	})

	const animatedStyle = useAnimatedStyle(() => ({
		zIndex: 1002,
		transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale: scale.value }]
	}))

	const backdropStyle = useAnimatedStyle(() => ({
		position: 'absolute',
		left: -originX.value,
		top: -originY.value,
		width: SCREEN_WIDTH,
		height: SCREEN_HEIGHT,
		opacity: backdropOpacity.value,
		zIndex: 1000
	}))

	const closeButtonStyle = useAnimatedStyle(() => ({
		position: 'absolute',
		top: 63 - originY.value,
		left: 26 - originX.value,
		opacity: closeButtonOpacity.value,
		zIndex: 1001
	}))

	const renderBackdrop = () => {
		if (Platform.OS === 'ios') {
			return <BlurView style={{ flex: 1 }} tint="dark" intensity={10} />
		}

		return (
			<BlurView
				style={{ flex: 1 }}
				tint="dark"
				intensity={30}
				blurTarget={blurTargetRef}
				blurMethod="dimezisBlurView"
			/>
		)
	}

	return (
		<View ref={containerRef} style={{ width: size, height: size }}>
			{isPortalVisible ? (
				<Portal>
					<GestureDetector gesture={backdropTapGesture}>
						<Animated.View style={backdropStyle}>{renderBackdrop()}</Animated.View>
					</GestureDetector>

					<Animated.View style={[styles.closeButton, closeButtonStyle]}>
						<TouchableOpacity onPress={resetValues} style={styles.closeButtonTouchable}>
							<Text style={styles.closeButtonText}>✕</Text>
						</TouchableOpacity>
					</Animated.View>

					<GestureDetector gesture={panGesture}>
						<Animated.View
							style={[
								{
									width: size,
									height: size,
									borderRadius: size / 2,
									overflow: 'hidden'
								},
								animatedStyle
							]}
						>
							{hasImage ? (
								<Image
									source={{ uri: imageUrl }}
									contentFit="cover"
									style={{
										width: '100%',
										height: '100%',
										borderRadius: size / 2,
										borderWidth: bordered ? 1 : 0,
										borderColor: 'rgba(255, 255, 255, 0.2)'
									}}
									onError={() => setImageError(true)}
								/>
							) : (
								<DummyAvatar size={size / 2} bordered={bordered} />
							)}
						</Animated.View>
					</GestureDetector>
				</Portal>
			) : (
				<GestureDetector gesture={tapGesture}>
					<Animated.View
						style={[
							{
								width: size,
								height: size,
								borderRadius: size / 2,
								overflow: 'hidden'
							},
							animatedStyle
						]}
					>
						{hasImage ? (
							<Image
								source={{ uri: imageUrl }}
								contentFit="cover"
								style={{
									width: '100%',
									height: '100%',
									borderRadius: size / 2,
									borderWidth: bordered ? 1 : 0,
									borderColor: 'rgba(255, 255, 255, 0.2)'
								}}
								onError={() => setImageError(true)}
							/>
						) : (
							<DummyAvatar size={size / 2} bordered={bordered} />
						)}
					</Animated.View>
				</GestureDetector>
			)}
		</View>
	)
}

const styles = StyleSheet.create({
	closeButton: {
		position: 'absolute',
		zIndex: 1000
	},
	closeButtonTouchable: {
		width: 40,
		height: 40,
		borderRadius: 40 / 2,
		backgroundColor: 'rgba(0,0,0,0.6)',
		justifyContent: 'center',
		alignItems: 'center'
	},
	closeButtonText: {
		color: 'white',
		fontSize: 15,
		fontWeight: 'bold'
	}
})
