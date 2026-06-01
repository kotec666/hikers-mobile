import * as React from 'react'
import Svg, { Circle, CircleProps } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'
import { Colors } from '@/constants/Colors'
import Animated from 'react-native-reanimated'

interface IProps {
	color?: string
	width?: number
	height?: number
	style?: StyleProp<ViewStyle>
	animatedCircleProps?: Partial<CircleProps>
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle)
const AnimatedStartWithCircleSvg = (props: IProps) => {
	const { width = 100, height = 100, animatedCircleProps, color = Colors['green-main'] } = props

	const centerX = width / 2
	const centerY = width / 2

	const circleRadius = 11

	return (
		<Svg
			width={width}
			height={height}
			fill="white"
			viewBox={`0 0 ${width} ${height}`}
			style={{
				width,
				height,
				borderRadius: width / 2
			}}
			{...props}
		>
			<AnimatedCircle
				cx={centerX}
				cy={centerY}
				r={circleRadius}
				fill={Colors.white}
				stroke={color}
				strokeWidth={circleRadius - 2}
				animatedProps={animatedCircleProps}
			/>
		</Svg>
	)
}

export default AnimatedStartWithCircleSvg
