import React from 'react'
import { StyleSheet } from 'react-native'
import { Canvas, FillType, Path, Skia } from '@shopify/react-native-skia'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, { SharedValue, useAnimatedStyle, useDerivedValue } from 'react-native-reanimated'
import { CropFrame } from './types'

type CropOverlayProps = {
	width: number
	height: number
	rectX: SharedValue<number>
	rectY: SharedValue<number>
	rectW: SharedValue<number>
	rectH: SharedValue<number>
	boundsX: SharedValue<number>
	boundsY: SharedValue<number>
	boundsW: SharedValue<number>
	boundsH: SharedValue<number>
	aspectLock: number | null
	minCropSize: number
	/** 'circle' — вырез и рамка рисуются овалом, вписанным в тот же bounding box. По умолчанию 'square'. */
	frame?: CropFrame
}

const HANDLE_SIZE = 26
const clampWorklet = (value: number, min: number, max: number) => {
	'worklet'
	return Math.min(Math.max(value, min), max)
}

export function CropOverlay({
	width,
	height,
	rectX,
	rectY,
	rectW,
	rectH,
	boundsX,
	boundsY,
	boundsW,
	boundsH,
	aspectLock,
	minCropSize,
	frame = 'square'
}: CropOverlayProps) {
	// Path для затемнения всего, что вне рамки кропа (evenOdd: внешний прямоугольник минус вырез).
	// Актуальный (не deprecated) API: Skia.PathBuilder вместо мутабельного Skia.Path.Make().
	const maskPath = useDerivedValue(() => {
		const builder = Skia.PathBuilder.Make()
		builder.addRect(Skia.XYWHRect(0, 0, width, height))

		if (frame === 'circle') {
			builder.addOval(Skia.XYWHRect(rectX.value, rectY.value, rectW.value, rectH.value))
		} else {
			builder.addRect(Skia.XYWHRect(rectX.value, rectY.value, rectW.value, rectH.value))
		}

		builder.setFillType(FillType.EvenOdd)
		return builder.build()
	}, [width, height, frame])

	const borderStyle = useAnimatedStyle(() => ({
		position: 'absolute',
		left: rectX.value,
		top: rectY.value,
		width: rectW.value,
		height: rectH.value,
		borderWidth: 1.5,
		borderColor: 'rgba(255,255,255,0.9)',
		borderRadius: frame === 'circle' ? rectW.value / 2 : 0
	}))

	const moveGesture = Gesture.Pan().onChange((e) => {
		const maxX = boundsX.value + boundsW.value - rectW.value
		const maxY = boundsY.value + boundsH.value - rectH.value
		rectX.value = clampWorklet(rectX.value + e.changeX, boundsX.value, maxX)
		rectY.value = clampWorklet(rectY.value + e.changeY, boundsY.value, maxY)
	})

	const moveStyle = useAnimatedStyle(() => ({
		position: 'absolute',
		left: rectX.value,
		top: rectY.value,
		width: rectW.value,
		height: rectH.value
	}))

	/** Универсальный обработчик перетаскивания угла. anchorRight/anchorBottom: какая сторона рамки неподвижна */
	const makeCornerGesture = (anchorRight: boolean, anchorBottom: boolean) =>
		Gesture.Pan().onChange((e) => {
			let newX = rectX.value
			let newY = rectY.value
			let newW = rectW.value
			let newH = rectH.value

			if (!anchorRight) {
				// тянем левый край
				const proposedX = clampWorklet(
					rectX.value + e.changeX,
					boundsX.value,
					rectX.value + rectW.value - minCropSize
				)
				newW = rectW.value + (rectX.value - proposedX)
				newX = proposedX
			} else {
				newW = clampWorklet(rectW.value + e.changeX, minCropSize, boundsX.value + boundsW.value - rectX.value)
			}

			if (aspectLock) {
				newH = newW / aspectLock
				if (anchorBottom) {
					// верхний край фиксирован — растим вниз
				} else {
					newY = rectY.value + rectH.value - newH
				}
			} else if (!anchorBottom) {
				const proposedY = clampWorklet(
					rectY.value + e.changeY,
					boundsY.value,
					rectY.value + rectH.value - minCropSize
				)
				newH = rectH.value + (rectY.value - proposedY)
				newY = proposedY
			} else {
				newH = clampWorklet(rectH.value + e.changeY, minCropSize, boundsY.value + boundsH.value - rectY.value)
			}

			rectX.value = newX
			rectY.value = newY
			rectW.value = newW
			rectH.value = newH
		})

	const topLeftGesture = makeCornerGesture(false, false)
	const topRightGesture = makeCornerGesture(true, false)
	const bottomLeftGesture = makeCornerGesture(false, true)
	const bottomRightGesture = makeCornerGesture(true, true)

	return (
		<Animated.View style={StyleSheet.absoluteFill} pointerEvents="box-none">
			<Canvas style={StyleSheet.absoluteFill} pointerEvents="none">
				<Path path={maskPath} color="rgba(0,0,0,0.55)" />
			</Canvas>

			<Animated.View style={borderStyle} pointerEvents="none" />

			<GestureDetector gesture={moveGesture}>
				<Animated.View style={moveStyle} />
			</GestureDetector>

			<CornerHandle
				corner="tl"
				gesture={topLeftGesture}
				rectX={rectX}
				rectY={rectY}
				rectW={rectW}
				rectH={rectH}
			/>
			<CornerHandle
				corner="tr"
				gesture={topRightGesture}
				rectX={rectX}
				rectY={rectY}
				rectW={rectW}
				rectH={rectH}
			/>
			<CornerHandle
				corner="bl"
				gesture={bottomLeftGesture}
				rectX={rectX}
				rectY={rectY}
				rectW={rectW}
				rectH={rectH}
			/>
			<CornerHandle
				corner="br"
				gesture={bottomRightGesture}
				rectX={rectX}
				rectY={rectY}
				rectW={rectW}
				rectH={rectH}
			/>
		</Animated.View>
	)
}

type CornerHandleProps = {
	corner: 'tl' | 'tr' | 'bl' | 'br'
	gesture: ReturnType<typeof Gesture.Pan>
	rectX: SharedValue<number>
	rectY: SharedValue<number>
	rectW: SharedValue<number>
	rectH: SharedValue<number>
}

function CornerHandle({ corner, gesture, rectX, rectY, rectW, rectH }: CornerHandleProps) {
	const isRight = corner === 'tr' || corner === 'br'
	const isBottom = corner === 'bl' || corner === 'br'

	const style = useAnimatedStyle(() => ({
		position: 'absolute',
		left: (isRight ? rectX.value + rectW.value : rectX.value) - HANDLE_SIZE / 2,
		top: (isBottom ? rectY.value + rectH.value : rectY.value) - HANDLE_SIZE / 2,
		width: HANDLE_SIZE,
		height: HANDLE_SIZE
	}))

	return (
		<GestureDetector gesture={gesture}>
			<Animated.View style={[styles.handle, style]} hitSlop={10} />
		</GestureDetector>
	)
}

const styles = StyleSheet.create({
	handle: {
		borderRadius: HANDLE_SIZE / 2,
		backgroundColor: 'white',
		borderWidth: 1,
		borderColor: 'rgba(0,0,0,0.2)'
	}
})
