import { useEffect, useState, useRef } from 'react'
import { Text, StyleSheet, Dimensions, Animated, PanResponder } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

interface IProps {
	text?: string
	type: 'error' | 'info' | 'success'
}

export function Notification({ text, type }: IProps) {
	const [isShown, setIsShown] = useState<boolean>(false)
	const animatedValue = useRef(new Animated.Value(-100)).current
	const pan = useRef(new Animated.ValueXY()).current
	const direction = useRef<'x' | 'y' | null>(null)

	const bgColor = type === 'error' ? '#EF4444' : type === 'success' ? '#22C55E' : '#FFFFFF'

	const textColor = type === 'info' ? '#000000' : '#FFFFFF'

	const onEnter = () => {
		Animated.timing(animatedValue, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true
		}).start()
	}

	const onExit = (velocity = 0) => {
		Animated.timing(animatedValue, {
			toValue: -100,
			duration: 300,
			useNativeDriver: true
		}).start(() => setIsShown(false))

		Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start()
		direction.current = null
	}

	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dy) > 5 || Math.abs(gesture.dx) > 5,
			onPanResponderMove: (_, gesture) => {
				if (!direction.current) {
					direction.current = Math.abs(gesture.dy) > Math.abs(gesture.dx) ? 'y' : 'x'
				}

				if (direction.current === 'y') {
					pan.setValue({ x: 0, y: gesture.dy })
				} else {
					pan.setValue({ x: gesture.dx, y: 0 })
				}
			},
			onPanResponderRelease: (_, gesture) => {
				const threshold = 50
				if (
					(direction.current === 'y' && gesture.dy < -threshold) ||
					(direction.current === 'x' && Math.abs(gesture.dx) > threshold)
				) {
					Animated.timing(pan, {
						toValue: {
							x:
								direction.current === 'x'
									? gesture.dx > 0
										? Dimensions.get('screen').width
										: -Dimensions.get('screen').width
									: 0,
							y: direction.current === 'y' ? -100 : 0
						},
						duration: 200,
						useNativeDriver: true
					}).start(() => setIsShown(false))
				} else {
					Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start()
				}
				direction.current = null
			}
		})
	).current

	useEffect(() => {
		if (!text) return

		setIsShown(true)
		onEnter()

		const timerId = setTimeout(() => {
			onExit()
		}, 3000)

		return () => clearTimeout(timerId)
	}, [text])

	if (!isShown) return null

	return (
		<Animated.View
			{...panResponder.panHandlers}
			style={[
				styles.container,
				{
					backgroundColor: bgColor,
					transform: [{ translateY: animatedValue }, { translateX: pan.x }, { translateY: pan.y }]
				}
			]}
		>
			<Text style={[styles.text, { color: textColor }]}>{text}</Text>
		</Animated.View>
	)
}

const styles = StyleSheet.create({
	container: {
		position: 'absolute',
		width: Dimensions.get('screen').width,
		padding: 15,
		top: 50,
		zIndex: 1000
	},
	text: {
		fontSize: 16,
		textAlign: 'center',
		fontFamily: fontFamily.regular
	}
})
