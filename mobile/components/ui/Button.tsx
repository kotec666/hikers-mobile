import { PropsWithChildren, useRef } from 'react'
import { cn } from '@/helpers/cn'
import { fontFamily } from '@/constants/Fonts'
import { ActivityIndicator, Animated, GestureResponderEvent, Pressable, PressableProps } from 'react-native'
import { Colors } from '@/constants/Colors'

const buttonBaseStyles = 'rounded-full w-full h-[50px] flex justify-center items-center flex-row'

const variantColors = {
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
	isLoading?: boolean
	variant: keyof typeof variantColors
}

export function Button(props: Props & PressableProps) {
	const { children, className, variant, isLoading, ...restProps } = props

	const animatedValue = useRef(new Animated.Value(0)).current
	const colors = variantColors[variant]

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
		<Pressable
			onPressIn={!isLoading ? fadeIn : undefined}
			onPressOut={!isLoading ? fadeOut : undefined}
			disabled={isLoading}
			{...restProps}
		>
			<Animated.View
				style={{
					backgroundColor: isLoading ? Colors['gray-92'] : btnColor
				}}
				className={cn(buttonBaseStyles, className)}
			>
				{!isLoading && (
					<Animated.Text
						className="text-sm"
						style={{
							fontFamily: fontFamily.bold,
							color: textColor
						}}
					>
						{children}
					</Animated.Text>
				)}
				{isLoading && <ActivityIndicator size="large" color={Colors.white} />}
			</Animated.View>
		</Pressable>
	)
}
