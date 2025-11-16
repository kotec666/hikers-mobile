import * as React from 'react'
import Svg, { Circle } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'
import { Colors } from '@/constants/Colors'

interface IProps {
	width?: number
	height?: number
	style?: StyleProp<ViewStyle>
}

const StartWithCircleSvg = (props: IProps) => {
	const { width = 100, height = 100 } = props

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
			<Circle
				cx={centerX}
				cy={centerY}
				r={circleRadius}
				fill={Colors.white}
				stroke={Colors['green-main']}
				strokeWidth={circleRadius - 2}
			/>
		</Svg>
	)
}

export default StartWithCircleSvg
