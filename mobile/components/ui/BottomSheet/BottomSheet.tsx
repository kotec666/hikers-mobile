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
import { useTranslation } from 'react-i18next'

const { height: screenHeight } = Dimensions.get('screen')

// --- Геометрия шита и плавающей кнопки «Готово» (единая точка правды) ---
const DEFAULT_DETENT = 0.5 // высота шита при открытии по умолчанию (доля экрана)
const GRABBER_TOP_MARGIN = 10 // grabberOptions.topMargin
const SHEET_TOP_PADDING = 20 // внутренний отступ сверху у шита
const CLOSED_POSITION_Y = screenHeight // верхняя кромка шита в закрытом положении
const OPEN_POSITION_Y = screenHeight * (1 - DEFAULT_DETENT) // верхняя кромка в открытом положении
const CLOSE_THRESHOLD = 10 // допуск для признания шита закрытым
const OPACITY_FADE_DISTANCE = 50 // на каком расстоянии от закрытого положения кнопка полностью исчезает
const BUTTON_HIDDEN_TOP = screenHeight + 20 // положение кнопки за пределами экрана
const BUTTON_SLIDE_LIFT = 30 // дополнительное смещение кнопки вниз по мере открытия шита
// Отступ от верхней кромки шита до кнопки задан долей высоты открытого шита,
// а не плоскими пикселями: так кнопка держит одинаковое относительное положение
// на любом размере экрана и одинаково на iOS/Android. Кнопка «виснет» на 1/5
// высоты открытого шита выше его кромки (эквивалент старого фикс. отступа ~70dp).
const BUTTON_GAP_RATIO = 0.3
const BUTTON_TOP_OFFSET = OPEN_POSITION_Y * BUTTON_GAP_RATIO

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
	const { t } = useTranslation()
	const { blurDisabled, onDone, children, ...restProps } = props
	const bottomSheetRef = useRef<TrueSheet | null>(null)
	const blurTargetRef = useBlurContext()
	const isIOS = Platform.OS === 'ios'
	const isGlassAvailable = isIOS && isLiquidGlassAvailable()

	const sheetPosition = useSharedValue(CLOSED_POSITION_Y)

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

	const handleDidDismiss = useCallback(() => {
		// TrueSheet не всегда доезжает до финальной позиции в onPositionChange —
		// если не вернуть shared value в закрытое положение, плавающая кнопка
		// застрянет на экране после dismiss.
		sheetPosition.value = CLOSED_POSITION_Y
	}, [sheetPosition])

	const floatingButtonStyle = useAnimatedStyle(() => {
		const opacity = interpolate(
			sheetPosition.value,
			[CLOSED_POSITION_Y - OPACITY_FADE_DISTANCE, OPEN_POSITION_Y],
			[0, 1]
		)
		const isClosed = sheetPosition.value > CLOSED_POSITION_Y - CLOSE_THRESHOLD

		return {
			top: isClosed ? BUTTON_HIDDEN_TOP : sheetPosition.value - BUTTON_TOP_OFFSET,
			opacity,
			transform: [
				{
					translateY: interpolate(
						sheetPosition.value,
						[CLOSED_POSITION_Y, OPEN_POSITION_Y],
						[0, BUTTON_SLIDE_LIFT]
					)
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
						{t('common.ready')}
					</Button>
				</Animated.View>
			)}

			<TrueSheet
				ref={bottomSheetRef}
				cornerRadius={24}
				backgroundColor={blurDisabled ? 'rgba(0, 0, 0, 1)' : 'transparent'}
				detents={restProps.detents ?? [DEFAULT_DETENT]}
				grabberOptions={{
					topMargin: GRABBER_TOP_MARGIN,
					color: Colors['gray-d9'],
					adaptive: false
				}}
				style={{
					paddingTop: SHEET_TOP_PADDING
				}}
				onPositionChange={handlePositionChange}
				onDidDismiss={handleDidDismiss}
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
