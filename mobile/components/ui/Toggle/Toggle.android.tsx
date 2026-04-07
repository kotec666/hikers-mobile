import React, { useEffect } from 'react'
import { StyleSheet, Pressable } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withTiming, interpolateColor } from 'react-native-reanimated'
import { ToggleProps } from '@/components/ui/Toggle/Toggle.types'
import { scheduleOnRN } from 'react-native-worklets'
import { Colors } from '@/constants/Colors'
import { cn } from '@/helpers/cn'

const WIDTH = 40
const HEIGHT = 24
const THUMB = 20
const TRACK_ON = Colors['green-main']
const TRACK_OFF = Colors['gray-ab']
const DURATION = 200
const HORIZONTAL_PADDING = 2

const ToggleAndroid = ({ value, onChange, disabled }: ToggleProps) => {
	const progress = useSharedValue(value ? 1 : 0)
	const thumbX = useSharedValue(value ? WIDTH - THUMB - HORIZONTAL_PADDING : HORIZONTAL_PADDING)

	const pan = Gesture.Pan()
		.onChange((e) => {
			if (disabled) return
			const newX = Math.min(
				Math.max(thumbX.value + e.changeX, HORIZONTAL_PADDING),
				WIDTH - THUMB - HORIZONTAL_PADDING
			)
			thumbX.value = newX
			progress.value = (newX - HORIZONTAL_PADDING) / (WIDTH - THUMB - 2 * HORIZONTAL_PADDING)
		})
		.onEnd(() => {
			const isOn = progress.value > 0.5 ? 1 : 0
			progress.value = withTiming(isOn, { duration: DURATION })
			thumbX.value = withTiming(isOn ? WIDTH - THUMB - HORIZONTAL_PADDING : HORIZONTAL_PADDING, {
				duration: DURATION
			})
			scheduleOnRN(onChange, isOn === 1)
		})

	const trackStyle = useAnimatedStyle(() => {
		const bgColor = interpolateColor(progress.value, [0, 1], [TRACK_OFF, TRACK_ON])
		return { backgroundColor: bgColor }
	})

	const thumbStyle = useAnimatedStyle(() => {
		return { transform: [{ translateX: thumbX.value }] }
	})

	const handlePress = () => {
		const newValue = !value
		progress.value = withTiming(newValue ? 1 : 0, { duration: DURATION })
		thumbX.value = withTiming(newValue ? WIDTH - THUMB - HORIZONTAL_PADDING : HORIZONTAL_PADDING, {
			duration: DURATION
		})
		onChange(newValue)
	}

	// Синхронизация анимации с внешним состоянием
	useEffect(() => {
		const toValue = value ? 1 : 0

		progress.value = withTiming(toValue, { duration: DURATION })
		thumbX.value = withTiming(value ? WIDTH - THUMB - HORIZONTAL_PADDING : HORIZONTAL_PADDING, {
			duration: DURATION
		})
	}, [value])

	return (
		<GestureDetector gesture={pan}>
			<Pressable className={cn('', { 'opacity-50': disabled })} disabled={disabled} onPress={handlePress}>
				<Animated.View style={[styles.track, trackStyle]}>
					<Animated.View style={[styles.thumb, thumbStyle]} />
				</Animated.View>
			</Pressable>
		</GestureDetector>
	)
}

const styles = StyleSheet.create({
	track: {
		width: WIDTH,
		height: HEIGHT,
		borderRadius: HEIGHT / 2,
		justifyContent: 'center',
		padding: (HEIGHT - THUMB) / 2
	},
	thumb: {
		width: THUMB,
		height: THUMB,
		borderRadius: THUMB / 2,
		backgroundColor: 'white',
		position: 'absolute',
		left: 0
	}
})

export default ToggleAndroid
