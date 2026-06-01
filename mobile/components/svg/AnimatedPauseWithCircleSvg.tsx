import * as React from 'react'
import Svg, { Circle, G } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'
import { Colors } from '@/constants/Colors'
import { PathProps } from 'react-native-svg/src/elements/Path'
import AnimatedPauseSvg from '@/components/svg/AnimatedPauseSvg'

interface IProps {
	width?: number
	height?: number
	style?: StyleProp<ViewStyle>
	color?: string
	animatedPathProps?: Partial<PathProps>
}

const AnimatedPauseWithCircleSvg = (props: IProps) => {
	const { width = 100, height = 100, animatedPathProps, color = Colors['green-main'] } = props

	const centerX = width / 2
	const centerY = width / 2

	const circleRadius = 16

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
			<Circle cx={centerX} cy={centerY} r={circleRadius} fill="white" strokeWidth={0} />
			<G transform={`translate(${centerX - 7}, ${centerY - 7})`}>
				<AnimatedPauseSvg width={14} height={14} color={color} animatedPathProps={animatedPathProps} />
			</G>
		</Svg>
	)
}

export default AnimatedPauseWithCircleSvg
