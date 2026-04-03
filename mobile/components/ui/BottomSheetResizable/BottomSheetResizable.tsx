import React, { forwardRef, ReactNode, useCallback, useImperativeHandle } from 'react'
import { Dimensions, Platform, StyleSheet, View } from 'react-native'
import { Gesture, GestureDetector, PanGesture } from 'react-native-gesture-handler'
import Animated, {
	Extrapolation,
	interpolate,
	useAnimatedProps,
	useAnimatedStyle,
	useSharedValue,
	withSpring,
	withTiming
} from 'react-native-reanimated'
import { Colors } from '@/constants/Colors'
import { BlurView } from 'expo-blur'
import { useBlurContext } from '@/components/providers/BlurProvider'
import Portal from '@/components/Portal/Portal'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

export type BottomSheetResizableRef = {
	scrollTo: (destination: number) => void
	isActive: () => boolean
	close: () => void
	open: (destination?: number) => void
}

type BottomSheetResizableProps = {
	children?: ReactNode
	blurDisabled?: boolean
}

const BottomSheetResizable = forwardRef<BottomSheetResizableRef, BottomSheetResizableProps>(
	({ children, blurDisabled }, ref) => {
		const insets = useSafeAreaInsets()
		const blurTargetRef = useBlurContext()
        const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

		const translateY = useSharedValue(0)
		const isSheetActive = useSharedValue(false)
		const gestureContext = useSharedValue({ y: 0 })
		const handleScale = useSharedValue(1)

		const TOP_OFFSET = insets.top
		const MAX_SHEET_TRANSLATION = -SCREEN_HEIGHT + TOP_OFFSET

		const scrollTo = useCallback((destination: number) => {
			'worklet'
			isSheetActive.value = destination !== 0
			translateY.value = withSpring(destination, { damping: 50, stiffness: 200 })
		}, [])

		const isActive = useCallback(() => isSheetActive.value, [])

		const close = useCallback(() => {
			'worklet'
			isSheetActive.value = false
			translateY.value = withSpring(0, { damping: 50, stiffness: 200 })
		}, [])

		const open = useCallback((destination = SNAP_POINTS[0]) => {
			'worklet'
			isSheetActive.value = true
			translateY.value = withSpring(destination, { damping: 50, stiffness: 200 })
		}, [])

		useImperativeHandle(
			ref,
			() => ({
				scrollTo,
				isActive,
				close,
				open
			}),
			[scrollTo, isActive, close, open]
		)

		// Snap points: 25%, 50%, 100%
		const SNAP_POINTS = [-SCREEN_HEIGHT * 0.25, -SCREEN_HEIGHT * 0.5, MAX_SHEET_TRANSLATION]

		const handleGesture = Gesture.Pan()
			.onStart(() => {
				gestureContext.value = { y: translateY.value }
				handleScale.value = withTiming(1.2, { duration: 100 })
			})
			.onUpdate((event) => {
				translateY.value = Math.max(event.translationY + gestureContext.value.y, MAX_SHEET_TRANSLATION)
			})
			.onEnd((event) => {
				handleScale.value = withTiming(1, { duration: 150 })

				// Расчёт ближайшего snap-point c учётом скорости (инерция)
				const velocity = event.velocityY
				const endPosition = translateY.value + velocity * 0.2 // грубая аппроксимация инерции

				let closestPoint = SNAP_POINTS[0]
				let minDist = Math.abs(endPosition - SNAP_POINTS[0])

				for (let i = 1; i < SNAP_POINTS.length; i++) {
					const dist = Math.abs(endPosition - SNAP_POINTS[i])
					if (dist < minDist) {
						minDist = dist
						closestPoint = SNAP_POINTS[i]
					}
				}

				// Если слишком сильно опущено вниз → закрываем
				if (translateY.value > -SCREEN_HEIGHT / 3) {
					scrollTo(0)
				} else {
					scrollTo(closestPoint)
				}
			})

		const animatedSheetStyle = useAnimatedStyle(() => {
			const hidden = translateY.value >= 0
			return {
				borderRadius: interpolate(
					translateY.value,
					[MAX_SHEET_TRANSLATION + 50, MAX_SHEET_TRANSLATION],
					[25, 5],
					Extrapolation.CLAMP
				),
				transform: [{ translateY: translateY.value }],
				display: hidden ? 'none' : 'flex'
			}
		})

		const animatedBackdropStyle = useAnimatedStyle(() => ({
			opacity: withTiming(isSheetActive.value ? 1 : 0, { duration: 300 })
		}))

		const animatedBackdropProps = useAnimatedProps(
			() =>
				({
					pointerEvents: isSheetActive.value ? 'auto' : 'none'
				}) as any
		)

		const animatedHandleStyle = useAnimatedStyle(() => ({
			opacity: withTiming(isSheetActive.value ? 1 : 0.5, { duration: 300 }),
			transform: [{ scale: handleScale.value }]
		}))

		// видимая высота шторки = -translateY (translateY отрицательное при поднятии)
		const animatedContentStyle = useAnimatedStyle(() => {
			const visibleHeight = Math.max(0, -translateY.value)
			return {
				height: visibleHeight
			}
		})

		const platformStyles = [
			styles.container,
			animatedSheetStyle,
			blurDisabled && { backgroundColor: 'rgba(0,0,0,0.9)' }
		]

        const renderBackground = () => {
            if (blurDisabled) return null

            if (isGlassAvailable) {
                return (
                    <GlassView
                        style={[
                            StyleSheet.absoluteFill,
                            { borderRadius: 25 }
                        ]}
                    />
                )
            }

            if (Platform.OS === 'ios') {
                return (
                    <BlurView
                        tint="dark"
                        style={StyleSheet.absoluteFill}
                        intensity={10}
                    />
                )
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
				<Animated.View
					onTouchStart={() => scrollTo(0)}
					style={[styles.backdrop, animatedBackdropStyle]}
					animatedProps={animatedBackdropProps}
				/>

				<Animated.View style={platformStyles}>
                    {renderBackground()}
                    <BottomSheetResizableContent
							animatedContentStyle={animatedContentStyle}
							animatedHandleStyle={animatedHandleStyle}
							handleGesture={handleGesture}
						>
							{children}
						</BottomSheetResizableContent>

				</Animated.View>
			</Portal>
		)
	}
)

const BottomSheetResizableContent = ({
	handleGesture,
	animatedHandleStyle,
	animatedContentStyle,
	children
}: {
	handleGesture: PanGesture
	animatedHandleStyle: { opacity: 1 | 0.5; transform: { scale: number }[] }
	animatedContentStyle: { height: number }
	children?: ReactNode
}) => {
	return (
		<>
			<GestureDetector gesture={handleGesture}>
				<View style={styles.handleWrap}>
					<Animated.View style={[styles.handle, animatedHandleStyle]} />
				</View>
			</GestureDetector>

			<Animated.View style={[styles.contentWrapper, animatedContentStyle]}>
				<View style={styles.contentInner}>{children}</View>
			</Animated.View>
		</>
	)
}

BottomSheetResizable.displayName = 'BottomSheetResizable'

export default BottomSheetResizable

const styles = StyleSheet.create({
	backdrop: {
		...StyleSheet.absoluteFill,
		backgroundColor: 'rgba(0,0,0,0.25)'
	},
	container: {
		height: SCREEN_HEIGHT,
		width: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.2)',
		position: 'absolute',
		top: SCREEN_HEIGHT,
		borderRadius: 25,
		overflow: 'hidden',
		zIndex: 2
	},
	handleWrap: {
		width: '100%'
	},
	handle: {
		width: 36,
		height: 4,
		backgroundColor: Colors['gray-d9'],
		alignSelf: 'center',
		marginVertical: 15,
		borderRadius: 2
	},
	contentWrapper: {
		width: '100%',
		overflow: 'hidden'
	},
	contentInner: {
		height: '100%'
	}
})
