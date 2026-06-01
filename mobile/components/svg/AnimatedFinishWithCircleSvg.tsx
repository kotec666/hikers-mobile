import * as React from 'react'
import Svg, { Circle, G } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'
import { PathProps } from 'react-native-svg/src/elements/Path'
import AnimatedFinishedFlagSvg from '@/components/svg/AnimatedFinishedFlagSvg'

interface IProps {
	color?: string
	width?: number
	height?: number
	style?: StyleProp<ViewStyle>
	animatedPathProps?: Partial<PathProps>
}

const AnimatedFinishWithCircleSvg = (props: IProps) => {
	const { width = 100, height = 100, animatedPathProps, color } = props

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
				<AnimatedFinishedFlagSvg color={color} animatedPathProps={animatedPathProps} />
			</G>
		</Svg>
	)
}

export default AnimatedFinishWithCircleSvg
