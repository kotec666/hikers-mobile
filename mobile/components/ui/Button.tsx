import { PropsWithChildren, useRef } from 'react'
import { cn } from '@/helpers/cn'
import { fontFamily } from '@/constants/Fonts'
import {
	ActivityIndicator,
	Animated,
	GestureResponderEvent,
	PressableProps,
	Platform,
	StyleSheet,
	View
} from 'react-native'
import { Colors } from '@/constants/Colors'
import { Motion } from '@legendapp/motion'
import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

const buttonBaseStyles = 'rounded-full w-full flex justify-center items-center flex-row'

const variantColors = {
	liquid: {
		from: 'transparent',
		to: 'transparent',
		textFrom: Colors.white,
		textTo: Colors.white
	},
	green: {
		from: Colors['green-20d'],
		to: Colors['green-main'],
		textFrom: Colors.white,
		textTo: Colors.black
	},
	white: {
		from: Colors['black-25'],
		to: Colors.white,
		textFrom: Colors.white,
		textTo: Colors.black
	},
	transparent: {
		from: Colors['black-5c'],
		to: 'transparent',
		textFrom: Colors.white,
		textTo: Colors.white
	},
	black: {
		from: Colors['gray-d9'],
		to: Colors['black-25'],
		textFrom: Colors.black,
		textTo: Colors.white
	},
	gray: {
		from: Colors['black-25'],
		to: Colors['gray-92'],
		textFrom: Colors.black,
		textTo: Colors.white
	},
	default: {
		from: Colors['black-25'],
		to: Colors.white,
		textFrom: Colors.white,
		textTo: Colors.black
	}
}

export interface Props extends PropsWithChildren {
	className?: string
	buttonHeight?: number
	buttonContainerClassName?: string
	isLoading?: boolean
	variant: keyof typeof variantColors
}

export function Button(props: Props & PressableProps) {
	const { children, className, buttonContainerClassName, variant, isLoading, buttonHeight, ...restProps } = props

	const animatedValue = useRef(new Animated.Value(0)).current
	const colors = variantColors[variant]
	const isLiquidVariant = variant === 'liquid'
	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

	const btnColor = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [colors.to, colors.from]
	})

	const textColor = animatedValue.interpolate({
		inputRange: [0, 1],
		outputRange: [colors.textTo, colors.textFrom]
	})

	const fadeIn = (e: GestureResponderEvent) => {
		Animated.timing(animatedValue, {
			toValue: 1,
			duration: 120,
			useNativeDriver: false
		}).start()
		props.onPressIn?.(e)
	}

	const fadeOut = (e: GestureResponderEvent) => {
		Animated.timing(animatedValue, {
			toValue: 0,
			duration: 120,
			useNativeDriver: false
		}).start()
		props.onPressOut?.(e)
	}

	return (
		<Motion.Pressable
			className={cn('flex-row', buttonContainerClassName)}
			onPressIn={!isLoading ? fadeIn : undefined}
			onPressOut={!isLoading ? fadeOut : undefined}
			{...restProps}
		>
			<Motion.View
				className="w-full"
				whileTap={{ scale: 0.95 }}
				transition={{
					type: 'spring',
					damping: 20,
					stiffness: 400
				}}
			>
				<Animated.View
					style={{
						backgroundColor: isLiquidVariant ? 'transparent' : isLoading ? Colors['gray-92'] : btnColor,
						height: buttonHeight || 50,
						overflow: 'hidden'
					}}
					className={cn(buttonBaseStyles, className)}
				>
					{isLiquidVariant && (
						<>
							{isGlassAvailable ? (
								<GlassView style={StyleSheet.absoluteFill} />
							) : Platform.OS === 'ios' ? (
								<BlurView tint="dark" intensity={20} style={StyleSheet.absoluteFill} />
							) : (
								<View
									style={[
										StyleSheet.absoluteFill,
										{
											backgroundColor: Colors['black-25']
										}
									]}
								/>
							)}
						</>
					)}

					{!isLoading && (
						<Animated.Text
							className="text-sm"
							style={{
								fontFamily: fontFamily.bold,
								fontVariant: ['tabular-nums'],
								color: textColor
							}}
						>
							{children}
						</Animated.Text>
					)}

					{isLoading && <ActivityIndicator size="large" color={Colors.white} />}
				</Animated.View>
			</Motion.View>
		</Motion.Pressable>
	)
}
