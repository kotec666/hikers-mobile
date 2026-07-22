// import React, { forwardRef, useCallback, useImperativeHandle } from 'react'
// import { View, StyleSheet, TouchableWithoutFeedback, Dimensions, Pressable, Platform } from 'react-native'
// import { BottomSheetHandle, BottomSheetProps } from '@/components/ui/BottomSheet/types'
// import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
// import { Gesture, GestureDetector } from 'react-native-gesture-handler'
// import { Colors } from '@/constants/Colors'
// import { BlurView } from 'expo-blur'
// import { scheduleOnRN } from 'react-native-worklets'
// import Portal from '@/components/Portal/Portal'
// import { useBlurContext } from '@/components/providers/BlurProvider'
// import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
// import { Button } from '@/components/ui/Button'
//
// const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>(
// 	(
// 		{
// 			activeHeight,
// 			backDropColor = 'rgba(0,0,0,0.5)',
// 			backgroundColor = 'rgba(0, 0, 0, 1)',
// 			blurDisabled,
// 			children,
// 			onDone
// 		},
// 		ref
// 	) => {
// 		// const safeAreaInsets = useSafeAreaInsets()
// 		const blurTargetRef = useBlurContext()
// 		const { height: screenHeight } = Dimensions.get('screen')
// 		const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()
//
// 		const closedPositionY = screenHeight
// 		const openPositionY = screenHeight - activeHeight
//
// 		const sheetPositionY = useSharedValue(closedPositionY)
// 		const gestureStartPositionY = useSharedValue(0)
//
// 		const openSheet = useCallback(() => {
// 			sheetPositionY.value = withSpring(openPositionY, {
// 				damping: 50,
// 				stiffness: 150,
// 				mass: 0.5
// 			})
// 		}, [openPositionY, sheetPositionY])
//
// 		const closeSheet = useCallback(
// 			(onFinished?: () => void) => {
// 				sheetPositionY.value = withSpring(
// 					closedPositionY,
// 					{
// 						damping: 50,
// 						stiffness: 150,
// 						mass: 0.5
// 					},
// 					(finished) => {
// 						if (finished) {
// 							if (onFinished) {
// 								scheduleOnRN(onFinished)
// 							}
// 						}
// 					}
// 				)
// 			},
// 			[closedPositionY, sheetPositionY]
// 		)
//
// 		useImperativeHandle(
// 			ref,
// 			() => ({
// 				openSheet,
// 				closeSheet
// 			}),
// 			[openSheet, closeSheet]
// 		)
//
// 		const sheetStyle = useAnimatedStyle(() => ({
// 			top: sheetPositionY.value
// 		}))
//
// 		const backdropStyle = useAnimatedStyle(() => {
// 			const opacity = interpolate(sheetPositionY.value, [closedPositionY, openPositionY], [0, 0.5])
//
// 			return {
// 				opacity,
// 				display: opacity === 0 ? 'none' : 'flex'
// 			}
// 		})
//
// 		const floatingButtonStyle = useAnimatedStyle(() => {
// 			const opacity = interpolate(sheetPositionY.value, [closedPositionY - 50, openPositionY], [0, 1])
//
// 			return {
// 				top: sheetPositionY.value - 70,
// 				opacity,
// 				transform: [
// 					{
// 						translateY: interpolate(sheetPositionY.value, [openPositionY, closedPositionY], [0, 30])
// 					}
// 				]
// 			}
// 		})
//
// 		const panGestureHandler = Gesture.Pan()
// 			.onBegin(() => {
// 				gestureStartPositionY.value = sheetPositionY.value
// 			})
// 			.onUpdate((event) => {
// 				const newPositionY = gestureStartPositionY.value + event.translationY
// 				sheetPositionY.value = Math.min(Math.max(newPositionY, openPositionY), closedPositionY)
// 			})
// 			.onEnd(() => {
// 				if (sheetPositionY.value > openPositionY + 50) {
// 					sheetPositionY.value = withSpring(closedPositionY, {
// 						damping: 50,
// 						stiffness: 150,
// 						mass: 0.5
// 					})
// 				} else {
// 					sheetPositionY.value = withSpring(openPositionY, {
// 						damping: 50,
// 						stiffness: 150,
// 						mass: 0.5
// 					})
// 				}
// 			})
//
// 		const platformStyles = [
// 			styles.container,
// 			sheetStyle,
// 			{
// 				height: activeHeight,
// 				//paddingBottom: safeAreaInsets.bottom,
// 				...(blurDisabled && {
// 					backgroundColor
// 				})
// 			}
// 		]
//
// 		const renderBackground = () => {
// 			if (blurDisabled) return null
//
// 			if (isGlassAvailable) {
// 				return (
// 					<GlassView
// 						colorScheme="dark"
// 						style={[StyleSheet.absoluteFill, { borderTopLeftRadius: 50, borderTopRightRadius: 50 }]}
// 					/>
// 				)
// 			}
//
// 			if (Platform.OS === 'ios') {
// 				return <BlurView tint="dark" style={StyleSheet.absoluteFill} intensity={10} />
// 			}
//
// 			return (
// 				<BlurView
// 					tint="dark"
// 					style={StyleSheet.absoluteFill}
// 					intensity={23}
// 					blurTarget={blurTargetRef}
// 					blurMethod="dimezisBlurView"
// 				/>
// 			)
// 		}
//
// 		return (
// 			<Portal>
// 				<TouchableWithoutFeedback onPress={() => closeSheet()}>
// 					<Animated.View style={[styles.backdrop, backdropStyle, { backgroundColor: backDropColor }]} />
// 				</TouchableWithoutFeedback>
// 				{onDone && (
// 					<Animated.View style={[styles.floatingButton, floatingButtonStyle]}>
// 						<Button variant="black" onPress={onDone}>
// 							Готово
// 						</Button>
// 					</Animated.View>
// 				)}
//
// 				<Animated.View style={platformStyles}>
// 					<View
// 						style={{
// 							flex: 1
// 						}}
// 					>
// 						{renderBackground()}
//
// 						<GestureDetector gesture={panGestureHandler}>
// 							<Pressable style={styles.lineContainer}>
// 								<View style={styles.line} />
// 							</Pressable>
// 						</GestureDetector>
//
// 						<View style={styles.contentContainer}>{children}</View>
// 					</View>
// 				</Animated.View>
// 			</Portal>
// 		)
// 	}
// )
//
// BottomSheet.displayName = 'BottomSheet'
// export default BottomSheet
//
// const styles = StyleSheet.create({
// 	container: {
// 		position: 'absolute',
// 		borderTopLeftRadius: 25,
// 		borderTopRightRadius: 25,
// 		left: 0,
// 		right: 0,
// 		bottom: 0,
// 		zIndex: 2,
// 		elevation: 2,
// 		overflow: 'hidden'
// 	},
// 	contentContainer: {
// 		flex: 1
// 	},
// 	floatingButton: {
// 		position: 'absolute',
// 		left: 20,
// 		right: 20,
// 		zIndex: 999,
// 		elevation: 999
// 	},
// 	lineContainer: {
// 		height: 20,
// 		paddingVertical: 20,
// 		alignItems: 'center',
// 		justifyContent: 'flex-start'
// 	},
// 	line: {
// 		width: 36,
// 		height: 4,
// 		backgroundColor: Colors['gray-d9'],
// 		borderRadius: 20
// 	},
// 	backdrop: {
// 		top: 0,
// 		bottom: 0,
// 		left: 0,
// 		right: 0,
// 		position: 'absolute',
// 		zIndex: 1
// 	}
// })
