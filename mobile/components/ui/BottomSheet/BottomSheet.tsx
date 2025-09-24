import React, { forwardRef, useCallback, useImperativeHandle } from 'react'
import { View, StyleSheet, TouchableWithoutFeedback, Dimensions, Pressable } from 'react-native'
import { BottomSheetHandle, BottomSheetProps } from '@/components/ui/BottomSheet/types'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import { Colors } from '@/constants/Colors'
import { BlurView } from '@sbaiahmed1/react-native-blur'

const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
	({ activeHeight, backDropColor = 'rgba(0,0,0,0.5)', backgroundColor = 'rgba(0, 0, 0, 0.5)', children }, ref) => {
		const safeAreaInsets = useSafeAreaInsets()
		const { height: screenHeight } = Dimensions.get('screen')
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
		}, [])

		const closeSheet = useCallback(() => {
			sheetPositionY.value = withSpring(closedPositionY, {
				damping: 50,
				stiffness: 150,
				mass: 0.5
			})
		}, [])

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

		return (
			<>
				<TouchableWithoutFeedback onPress={closeSheet}>
					<Animated.View style={[styles.backdrop, backdropStyle, { backgroundColor: backDropColor }]} />
				</TouchableWithoutFeedback>
				<GestureDetector gesture={panGestureHandler}>
					<Animated.View
						style={[
							styles.container,
							sheetStyle,
							{
								height: activeHeight,
								// backgroundColor,
								paddingBottom: safeAreaInsets.bottom
							}
						]}
					>
						<BlurView
							reducedTransparencyFallbackColor="transparent"
							blurType="dark"
							blurAmount={10}
							style={[StyleSheet.absoluteFill, { overflow: 'hidden', backgroundColor: 'transparent' }]}
						/>
						<Pressable style={styles.lineContainer}>
							<View style={styles.line} />
						</Pressable>
						<View style={styles.contentContainer}>{children}</View>
					</Animated.View>
				</GestureDetector>
			</>
		)
	}
)

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
