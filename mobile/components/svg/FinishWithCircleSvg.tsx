import * as React from 'react'
import Svg, { Circle, G } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'
import FinishedFlagSvg from '@/components/svg/FinishedFlagSvg'

interface IProps {
	color?: string
	width?: number
	height?: number
	style?: StyleProp<ViewStyle>
}

const FinishWithCircleSvg = (props: IProps) => {
	const { width = 100, height = 100, color } = props

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
				<FinishedFlagSvg color={color} />
			</G>
		</Svg>
	)
}

export default FinishWithCircleSvg
