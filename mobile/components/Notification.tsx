import { useEffect, useState, useRef } from 'react'
import { Text, StyleSheet, Dimensions, Animated, PanResponder, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { cn } from '@/helpers/cn'
import {BlurView} from "expo-blur";

export enum NotificationInAppType {
	ERROR = 'error',
	INFO = 'info',
	SUCCESS = 'success'
}

interface IProps {
	text?: string
	type: NotificationInAppType
}

export function Notification({ text, type }: IProps) {
	const [isShown, setIsShown] = useState<boolean>(false)
	const isDismissingRef = useRef<boolean>(false)
	const animatedValue = useRef(new Animated.Value(-100)).current
	const pan = useRef(new Animated.ValueXY()).current
	const direction = useRef<'x' | 'y' | null>(null)

	const onEnter = () => {
		isDismissingRef.current = false
		Animated.timing(animatedValue, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true
		}).start()
	}

	const onExit = (velocity = 0) => {
		isDismissingRef.current = true
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
			onMoveShouldSetPanResponder: (_, gesture) => {
				if (isDismissingRef.current) return false
				return Math.abs(gesture.dy) > 5 || Math.abs(gesture.dx) > 5
			},
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
					transform: [{ translateY: animatedValue }, { translateX: pan.x }, { translateY: pan.y }]
				}
			]}
		>
			<View style={styles.blurContainer}>
				<BlurView
                    tint="dark"
                    intensity={10}
                    experimentalBlurMethod="dimezisBlurView"
					style={styles.blurView}
				>
					<View
						className={cn('rounded-[25px] py-[18px] px-[15px]', {
							'bg-green-main/20': type === NotificationInAppType.SUCCESS,
							'bg-red-ff/20': type === NotificationInAppType.ERROR,
							'bg-black/20': type === NotificationInAppType.INFO
						})}
					>
						<Text
							style={[styles.text]}
							className={cn('', {
								'text-green-main': type === NotificationInAppType.SUCCESS,
								'text-red-ff': type === NotificationInAppType.ERROR,
								'text-white': type === NotificationInAppType.INFO
							})}
						>
							{text}
						</Text>
					</View>
				</BlurView>
			</View>
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
	blurContainer: {
		borderRadius: 25,
		overflow: 'hidden'
	},
	blurView: {
		flex: 1,
		overflow: 'hidden',
		backgroundColor: 'transparent'
	},
	text: {
		fontSize: 16,
		textAlign: 'left',
		fontFamily: fontFamily.regular
	}
})
