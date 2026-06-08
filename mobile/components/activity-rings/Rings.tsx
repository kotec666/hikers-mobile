import { Canvas, vec } from '@shopify/react-native-skia'
import React, { memo } from 'react'
import { useWindowDimensions, View } from 'react-native'

import { Ring } from './Ring'

// const { width, height } = Dimensions.get('window')
// const containerPadding = 32
// const calculatedWidth = width - containerPadding
// const center = vec(calculatedWidth / 2, height / 2)

// export const { PI } = Math
// export const TAU = 2 * PI
// export const SIZE = calculatedWidth
// export const strokeWidth = SIZE * 0.1

const color = (r: number, g: number, b: number) => `rgb(${r * 255}, ${g * 255}, ${b * 255})`

export const Rings = memo(
	({ circleSize, isAnimated = false }: { circleSize?: number; isAnimated?: boolean }) => {
		const { width } = useWindowDimensions()

		const SIZE = circleSize || width - 32 // или под контейнер
		const strokeWidth = SIZE * 0.1
		const center = vec(SIZE / 2, SIZE / 2)

		const rings = [
			{
				totalProgress: 1.3,
				colors: [color(0.008, 1, 0.659), color(0, 0.847, 1)],
				background: color(0.016, 0.227, 0.212),
				size: SIZE - strokeWidth * 4
			},
			{
				totalProgress: 0.4,
				colors: [color(0.847, 1, 0), color(0.6, 1, 0.004)],
				background: color(0.133, 0.2, 0),
				size: SIZE - strokeWidth * 2
			},
			{
				totalProgress: 1.6,
				colors: [color(0.98, 0.067, 0.31), color(0.976, 0.22, 0.522)],
				background: color(0.196, 0.012, 0.063),
				size: SIZE
			}
		]

		return (
			<View style={{ width: SIZE, height: SIZE, alignSelf: 'center' }}>
				<Canvas style={{ width: SIZE, height: SIZE }}>
					{/*<Fill color={bgColor || Colors['black-0d']} />*/}
					{rings.map((ring, index) => {
						return (
							<Ring
								key={index}
								ring={ring}
								center={center}
								strokeWidth={strokeWidth}
								isAnimated={isAnimated}
							/>
						)
					})}
				</Canvas>
			</View>
		)
	},
	(prevProps, nextProps) => {
		return prevProps.circleSize === nextProps.circleSize && prevProps.isAnimated === nextProps.isAnimated
	}
)

Rings.displayName = 'Rings'
