import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, TextInput, Text, StyleSheet, Pressable, AppState } from 'react-native'
import { Colors } from '@/constants/Colors'
import Animated, {
	useSharedValue,
	useAnimatedStyle,
	withRepeat,
	withTiming,
	Easing,
	withSequence
} from 'react-native-reanimated'
import * as Clipboard from 'expo-clipboard'

interface OTPInputProps {
	length?: number
	onDone?: (code: string) => void
	disabled?: boolean
	hasError?: boolean
	clearError?: () => void
}

export const OTPInput: React.FC<OTPInputProps> = ({
	length = 5,
	onDone,
	clearError,
	hasError = false,
	disabled = false
}) => {
	const opacity = useSharedValue(1)
	const shakeX = useSharedValue(0)
	const inputRef = useRef<TextInput>(null)

	const [isFocused, setIsFocused] = useState(false)
	const [code, setCode] = useState('')

	const triggerShake = useCallback(() => {
		shakeX.value = withSequence(
			withTiming(-10, { duration: 50 }),
			withTiming(10, { duration: 50 }),
			withTiming(-8, { duration: 50 }),
			withTiming(8, { duration: 50 }),
			withTiming(0, { duration: 50 })
		)
	}, [shakeX])

	useEffect(() => {
		if (hasError) {
			triggerShake()
		}
	}, [hasError, triggerShake])

	useEffect(() => {
		opacity.value = withRepeat(
			withTiming(0, {
				duration: 500,
				easing: Easing.linear
			}),
			-1,
			true
		)
	}, [opacity])

	const animatedShakeStyle = useAnimatedStyle(() => {
		return {
			transform: [{ translateX: shakeX.value }]
		}
	})

	const animatedCaretStyle = useAnimatedStyle(() => {
		return {
			opacity: opacity.value,
			transform: [{ scale: 0.9 + opacity.value * 0.1 }]
		}
	})

	const extractOTP = (text: string, length: number) => {
		const match = text.match(new RegExp(`\\b\\d{${length}}\\b`))
		return match ? match[0] : null
	}

	const checkClipboardForOTP = useCallback(async () => {
		try {
			const text = await Clipboard.getStringAsync()
			const otp = extractOTP(text, length)

			if (otp && otp !== code) {
				setCode(otp)
				onDone?.(otp)
			}
		} catch {
			// ignore
		}
	}, [code, length, onDone])

	useEffect(() => {
		const sub = AppState.addEventListener('change', (state) => {
			if (state === 'active') {
				return checkClipboardForOTP()
			}
		})

		return () => sub.remove()
	}, [checkClipboardForOTP, code])

	const handleChange = (text: string) => {
		let value = text.replace(/\D/g, '')

		if (value.length > length) {
			value = value.slice(0, length)
		}

		if (hasError) {
			clearError?.()
		}
		setCode(value)

		if (value.length === length) {
			onDone?.(value)
		}
	}

	const handlePress = () => {
		if (!disabled) {
			inputRef.current?.focus()
		}
	}

	return (
		<Pressable onPress={handlePress}>
			<Animated.View style={[styles.row, animatedShakeStyle]}>
				{Array.from({ length }).map((_, i) => {
					const isActive = isFocused && i === code.length

					return (
						<View key={i} style={[styles.box, hasError && styles.errorBox, isActive && styles.activeBox]}>
							{code[i] ? (
								<Text style={styles.text}>{code[i]}</Text>
							) : isActive ? (
								<Animated.View style={[styles.caret, animatedCaretStyle]} />
							) : null}
						</View>
					)
				})}
			</Animated.View>

			<TextInput
				ref={inputRef}
				style={styles.hiddenInput}
				value={code}
				onChangeText={handleChange}
				keyboardType="number-pad"
				textContentType="oneTimeCode"
				autoComplete="one-time-code"
				caretHidden
				maxLength={length}
				editable={!disabled}
				onFocus={() => setIsFocused(true)}
				onBlur={() => setIsFocused(false)}
			/>
		</Pressable>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	box: {
		width: 60,
		height: 60,
		borderRadius: 16,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: Colors['gray-3a'],
		borderWidth: 2,
		borderColor: 'rgba(255,255,255,0.2)'
	},
	activeBox: {
		borderColor: 'rgba(255,255,255,0.75)'
	},
	errorBox: {
		borderColor: Colors['red-ff4'],
		backgroundColor: Colors['red-3a']
	},
	text: {
		fontSize: 20,
		color: '#fff'
	},
	caret: {
		width: 2,
		height: 24,
		backgroundColor: Colors['yellow-main']
	},
	hiddenInput: {
		position: 'absolute',
		opacity: 0,
		width: '100%',
		height: '100%'
	}
})
