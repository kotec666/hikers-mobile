import React, { PropsWithChildren } from 'react'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
	SharedValue,
	useAnimatedReaction,
	useAnimatedStyle,
	useSharedValue,
	withTiming
} from 'react-native-reanimated'
import { getOrder, getPosition } from '@/helpers/drag'
import { scheduleOnRN } from 'react-native-worklets'
import { PositionsMap } from '@/components/ui/Profile/ActivityInfo'

interface IProps extends PropsWithChildren {
	positions: SharedValue<PositionsMap>
	id: number
	onDragEnd?: (payload: { id: number; oldOrder: number; newOrder: number }) => void
}

const Draggable = ({ children, positions, id, onDragEnd }: IProps) => {
	const position = getPosition(id)
	const translateX = useSharedValue(position.x)
	const translateY = useSharedValue(position.y)
	const startX = useSharedValue(0)
	const startY = useSharedValue(0)
	const isGestureActive = useSharedValue(false)

	useAnimatedReaction(
		() => positions.value[id],
		(newOrder) => {
			const newPositions = getPosition(newOrder)
			translateX.value = withTiming(newPositions.x)
			translateY.value = withTiming(newPositions.y)
		}
	)

	const panGesture = Gesture.Pan()
		.onBegin(() => {
			startX.value = translateX.value
			startY.value = translateY.value
			isGestureActive.value = true
		})
		.onUpdate((event) => {
			translateX.value = startX.value + event.translationX
			translateY.value = startY.value + event.translationY
		})
		.onEnd(() => {
			const oldOrder = positions.value[id]
			const newOrder = getOrder(translateX.value, translateY.value)

			if (oldOrder !== newOrder) {
				const idToSwap = Object.keys(positions.value).find((key) => positions.value[key] === newOrder)
				if (idToSwap) {
					const newPositions = JSON.parse(JSON.stringify(positions.value))
					newPositions[id] = newOrder
					newPositions[idToSwap] = oldOrder
					positions.value = newPositions
				}
			}

			if (onDragEnd) {
				scheduleOnRN(onDragEnd, { id, oldOrder, newOrder })
			}

			const destination = getPosition(positions.value[id])
			translateX.value = withTiming(destination.x)
			translateY.value = withTiming(destination.y)
		})
		.onFinalize(() => {
			isGestureActive.value = false
		})

	const animatedStyle = useAnimatedStyle(() => {
		const zIndex = isGestureActive.value ? 1000 : 1
		const scale = isGestureActive.value ? 1.1 : 1
		return {
			position: 'absolute',
			margin: 0,
			zIndex,
			transform: [{ translateX: translateX.value }, { translateY: translateY.value }, { scale }]
		}
	})

	return (
		<Animated.View style={animatedStyle}>
			<GestureDetector gesture={panGesture}>
				<Animated.View>{children}</Animated.View>
			</GestureDetector>
		</Animated.View>
	)
}

export default Draggable
