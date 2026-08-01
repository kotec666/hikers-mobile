import React, { forwardRef, useCallback, useImperativeHandle, useRef } from 'react'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'
import { Dimensions, Platform, StyleSheet } from 'react-native'
import { BlurView } from 'expo-blur'
import { useBlurContext } from '@/components/providers/BlurProvider'
import { Colors } from '@/constants/Colors'
import { PositionChangeEvent, TrueSheet, TrueSheetProps } from '@lodev09/react-native-true-sheet'
import { Button } from '@/components/ui/Button'
import Animated, { interpolate, useAnimatedStyle, useSharedValue } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'

const { height: screenHeight } = Dimensions.get('screen')

export interface BottomSheetProps extends TrueSheetProps {
	children: React.ReactNode
	blurDisabled?: boolean
	onDone?: () => void
}

export interface BottomSheetHandle {
	openSheet: () => Promise<void>
	closeSheet: (onFinished?: () => void) => Promise<void>
}

const BottomSheet = forwardRef<BottomSheetHandle, BottomSheetProps>((props, ref) => {
	const { blurDisabled, onDone, children, ...restProps } = props
	const bottomSheetRef = useRef<TrueSheet | null>(null)
	const blurTargetRef = useBlurContext()
	const isIOS = Platform.OS === 'ios'
	const isGlassAvailable = isIOS && isLiquidGlassAvailable()

	const closedPositionY = screenHeight

	const sheetPosition = useSharedValue(closedPositionY)

	const renderBackground = () => {
		if (blurDisabled) return null

		if (isGlassAvailable) {
			return (
				<GlassView
					colorScheme="dark"
					style={[
						StyleSheet.absoluteFill,
						{
							height: screenHeight,
							borderTopLeftRadius: 50,
							borderTopRightRadius: 50
						}
					]}
				/>
			)
		}

		if (Platform.OS === 'ios') {
			return (
				<BlurView
					tint="dark"
					style={[
						StyleSheet.absoluteFill,
						{
							height: screenHeight
						}
					]}
					intensity={23}
				/>
			)
		}

		return (
			<BlurView
				tint="dark"
				style={[
					StyleSheet.absoluteFill,
					{
						height: screenHeight
					}
				]}
				intensity={23}
				blurTarget={blurTargetRef}
				blurMethod="dimezisBlurView"
			/>
		)
	}

	const openSheet = useCallback(async () => {
		await bottomSheetRef.current?.present()
	}, [])

	const closeSheet = useCallback(async (onFinished?: () => void) => {
		await bottomSheetRef.current?.dismiss()
		if (onFinished) {
			scheduleOnRN(onFinished)
		}
	}, [])

	useImperativeHandle(
		ref,
		() => ({
			openSheet,
			closeSheet
		}),
		[openSheet, closeSheet]
	)

	const handlePositionChange = (e: PositionChangeEvent) => {
		sheetPosition.value = e.nativeEvent.position
	}

	const floatingButtonStyle = useAnimatedStyle(() => {
		const opacity = interpolate(sheetPosition.value, [closedPositionY - 50, screenHeight * 0.5], [0, 1])
		const isClosed = sheetPosition.value > closedPositionY - 10

		const buttonPosition = isIOS ? 180 : 150
		return {
			top: isClosed ? screenHeight + 20 : sheetPosition.value - buttonPosition,
			opacity,
			transform: [
				{
					translateY: interpolate(sheetPosition.value, [screenHeight, screenHeight * 0.5], [0, 30])
				}
			]
		}
	})

	return (
		<>
			{onDone && (
				<Animated.View
					style={[
						{
							position: 'absolute',
							left: 20,
							right: 20,
							zIndex: 999,
							elevation: 999
						},
						floatingButtonStyle
					]}
				>
					<Button variant="black" onPress={onDone}>
						Готово
					</Button>
				</Animated.View>
			)}

			<TrueSheet
				ref={bottomSheetRef}
				cornerRadius={24}
				backgroundColor={blurDisabled ? 'rgba(0, 0, 0, 1)' : 'transparent'}
				detents={restProps.detents ?? [0.5]}
				grabberOptions={{
					topMargin: 10,
					color: Colors['gray-d9'],
					adaptive: false
				}}
				style={{
					paddingTop: 20
				}}
				onPositionChange={handlePositionChange}
				{...restProps}
			>
				{renderBackground()}
				{children}
			</TrueSheet>
		</>
	)
})

BottomSheet.displayName = 'BottomSheet'

export default BottomSheet
