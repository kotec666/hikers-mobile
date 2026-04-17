import React, { forwardRef, useCallback, useImperativeHandle } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Dimensions, Pressable, Platform } from 'react-native'
import { BottomSheetHandle, BottomSheetProps } from '@/components/ui/BottomSheet/types'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Colors } from '@/constants/Colors'
import { BlurView } from 'expo-blur'
import { scheduleOnRN } from 'react-native-worklets'
import Portal from '@/components/Portal/Portal'
import { useBlurContext } from '@/components/providers/BlurProvider'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
	(
		{
			activeHeight,
			backDropColor = 'rgba(0,0,0,0.5)',
			backgroundColor = 'rgba(0, 0, 0, 1)',
			blurDisabled,
			children
		},
		ref
	) => {
		// const safeAreaInsets = useSafeAreaInsets()
		const blurTargetRef = useBlurContext()
		const { height: screenHeight } = Dimensions.get('screen')
		const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

		const closedPositionY = screenHeight
		const openPositionY = screenHeight - activeHeight

		const sheetPositionY = useSharedValue(closedPositionY)
		const gestureStartPositionY = useSharedValue(0)

		const openSheet = useCallback(() => {
			sheetPositionY.value = withSpring(openPositionY, {
				damping: 50,
				stiffness: 150,
				mass: 0.5
			})
		}, [openPositionY, sheetPositionY])

		const closeSheet = useCallback(
			(onFinished?: () => void) => {
				sheetPositionY.value = withSpring(
					closedPositionY,
					{
						damping: 50,
						stiffness: 150,
						mass: 0.5
					},
					(finished) => {
						if (finished) {
							if (onFinished) {
								scheduleOnRN(onFinished)
							}
						}
					}
				)
			},
			[closedPositionY, sheetPositionY]
		)

		useImperativeHandle(
			ref,
			() => ({
				openSheet,
				closeSheet
			}),
			[openSheet, closeSheet]
		)

		const sheetStyle = useAnimatedStyle(() => ({
			top: sheetPositionY.value
		}))

		const backdropStyle = useAnimatedStyle(() => {
			const opacity = interpolate(sheetPositionY.value, [closedPositionY, openPositionY], [0, 0.5])

			return {
				opacity,
				display: opacity === 0 ? 'none' : 'flex'
			}
		})

		const panGestureHandler = Gesture.Pan()
			.onBegin(() => {
				gestureStartPositionY.value = sheetPositionY.value
			})
			.onUpdate((event) => {
				const newPositionY = gestureStartPositionY.value + event.translationY
				sheetPositionY.value = Math.min(Math.max(newPositionY, openPositionY), closedPositionY)
			})
			.onEnd(() => {
				if (sheetPositionY.value > openPositionY + 50) {
					sheetPositionY.value = withSpring(closedPositionY, {
						damping: 50,
						stiffness: 150,
						mass: 0.5
					})
				} else {
					sheetPositionY.value = withSpring(openPositionY, {
						damping: 50,
						stiffness: 150,
						mass: 0.5
					})
				}
			})

		const platformStyles = [
			styles.container,
			sheetStyle,
			{
				height: activeHeight,
				//paddingBottom: safeAreaInsets.bottom,
				...(blurDisabled && {
					backgroundColor
				})
			}
		]

		const renderBackground = () => {
			if (blurDisabled) return null

			if (isGlassAvailable) {
				return (
					<GlassView
						style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 50, borderTopRightRadius: 50 }]}
					/>
				)
			}

			if (Platform.OS === 'ios') {
				return <BlurView tint="dark" style={StyleSheet.absoluteFill} intensity={10} />
			}

			return (
				<BlurView
					tint="dark"
					style={StyleSheet.absoluteFill}
					intensity={23}
					blurTarget={blurTargetRef}
					blurMethod="dimezisBlurView"
				/>
			)
		}

		return (
			<Portal>
				<TouchableWithoutFeedback onPress={() => closeSheet()}>
					<Animated.View style={[styles.backdrop, backdropStyle, { backgroundColor: backDropColor }]} />
				</TouchableWithoutFeedback>
				<GestureDetector gesture={panGestureHandler}>
					<Animated.View style={platformStyles}>
						<View
							style={{
								flex: 1
							}}
						>
							{renderBackground()}
							<Pressable style={styles.lineContainer}>
								<View style={styles.line} />
							</Pressable>
							<View style={styles.contentContainer}>{children}</View>
						</View>
					</Animated.View>
				</GestureDetector>
			</Portal>
		)
	}
)

BottomSheet.displayName = 'BottomSheet'
export default BottomSheet

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		borderTopLeftRadius: 50,
		borderTopRightRadius: 50,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 2,
		elevation: 2,
		overflow: 'hidden'
	},
	contentContainer: {
		flex: 1
	},
	lineContainer: {
		height: 20,
		paddingVertical: 20,
		alignItems: 'center',
		justifyContent: 'flex-start'
	},
	line: {
		width: 36,
		height: 4,
		backgroundColor: Colors['gray-d9'],
		borderRadius: 20
	},
	backdrop: {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		position: 'absolute',
		zIndex: 1
	}
})
