import { useCallback, useEffect, useState, useRef } from 'react'
import { Text, StyleSheet, Dimensions, Animated, PanResponder, View, Platform, Pressable } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { cn } from '@/helpers/cn'
import { BlurView } from 'expo-blur'
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect'

export enum NotificationInAppType {
	ERROR = 'error',
	INFO = 'info',
	SUCCESS = 'success'
}

interface IProps {
	text?: string | boolean
	type: NotificationInAppType
	onPress?: () => void
	clearErrorCallback?: () => void
}

const NotificationContainer = ({ type, text }: { type: NotificationInAppType; text?: string | boolean }) => {
	return (
		<View
			className={cn('rounded-[25px] py-[18px] px-[15px]', {
				'bg-green-main/20': type === NotificationInAppType.SUCCESS && Platform.OS === 'ios',
				'bg-red-ff/20': type === NotificationInAppType.ERROR && Platform.OS === 'ios',
				'bg-black/20': type === NotificationInAppType.INFO && Platform.OS === 'ios',
				'bg-green-main/90': type === NotificationInAppType.SUCCESS && Platform.OS === 'android',
				'bg-red-ff/90': type === NotificationInAppType.ERROR && Platform.OS === 'android',
				'bg-black/90': type === NotificationInAppType.INFO && Platform.OS === 'android'
			})}
		>
			<Text
				style={[styles.text]}
				className={cn('', {
					'text-green-main': type === NotificationInAppType.SUCCESS && Platform.OS === 'ios',
					'text-red-ff': type === NotificationInAppType.ERROR && Platform.OS === 'ios',
					'text-white':
						(type === NotificationInAppType.INFO && Platform.OS === 'ios') ||
						(type === NotificationInAppType.SUCCESS && Platform.OS === 'android') ||
						(type === NotificationInAppType.ERROR && Platform.OS === 'android') ||
						(type === NotificationInAppType.INFO && Platform.OS === 'android')
				})}
			>
				{text}
			</Text>
		</View>
	)
}

export function Notification({ text, type, onPress, clearErrorCallback }: IProps) {
	const [isShown, setIsShown] = useState<boolean>(false)
	const isDismissingRef = useRef<boolean>(false)
	const isSwipeRef = useRef(false)
	const direction = useRef<'x' | 'y' | null>(null)
	const [animatedValue] = useState(() => new Animated.Value(-100))
	const [pan] = useState(() => new Animated.ValueXY())

	const isGlassAvailable = Platform.OS === 'ios' && isLiquidGlassAvailable()

	const onEnter = useCallback(() => {
		isDismissingRef.current = false
		Animated.timing(animatedValue, {
			toValue: 0,
			duration: 300,
			useNativeDriver: true
		}).start()
	}, [animatedValue])

	const onExit = useCallback(() => {
		isDismissingRef.current = true
		Animated.timing(animatedValue, {
			toValue: -100,
			duration: 300,
			useNativeDriver: true
		}).start(() => setIsShown(false))

		Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start()
		direction.current = null
		setTimeout(() => {
			clearErrorCallback?.()
		}, 300)
	}, [animatedValue, clearErrorCallback, pan])

	const panResponder = useRef(
		// eslint-disable-next-line react-hooks/refs -- колбэки PanResponder выполняются только при реальном жесте, не при рендере
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gesture) => {
				if (isDismissingRef.current) return false
				const isMove = Math.abs(gesture.dy) > 5 || Math.abs(gesture.dx) > 5
				if (isMove) isSwipeRef.current = true

				return isMove
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

				setTimeout(() => {
					isSwipeRef.current = false
				}, 0)
			}
		})
	).current

	useEffect(() => {
		if (!text) return

		// eslint-disable-next-line react-hooks/set-state-in-effect -- setIsShown здесь неразрывно связан с запуском анимации и таймера, а не просто выводится из пропсов
		setIsShown(true)
		onEnter()

		const timerId = setTimeout(() => {
			onExit()
		}, 3000)

		return () => clearTimeout(timerId)
	}, [onEnter, onExit, text])

	if (!isShown) return null

	return (
		<Animated.View
			// eslint-disable-next-line react-hooks/refs
			{...panResponder.panHandlers}
			style={[
				styles.container,
				{
					transform: [{ translateY: animatedValue }, { translateX: pan.x }, { translateY: pan.y }]
				}
			]}
		>
			<Pressable
				onPress={() => {
					if (!isSwipeRef.current) {
						onPress?.()
						onExit()
					}
				}}
			>
				<View style={styles.blurContainer}>
					{Platform.OS === 'ios' ? (
						isGlassAvailable ? (
							<GlassView pointerEvents="none" style={styles.blurView}>
								<NotificationContainer type={type} text={text} />
							</GlassView>
						) : (
							<BlurView tint="dark" intensity={10} style={styles.blurView}>
								<NotificationContainer type={type} text={text} />
							</BlurView>
						)
					) : (
						<NotificationContainer type={type} text={text} />
					)}
				</View>
			</Pressable>
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
