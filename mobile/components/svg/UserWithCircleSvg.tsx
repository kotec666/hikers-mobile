import * as React from 'react'
import Svg, { Circle, Polygon, G } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'
import { Colors } from '@/constants/Colors'

interface IProps {
	width?: number
	height?: number
	style?: StyleProp<ViewStyle>
	heading: number | null
}

const UserWithCircleSvg = (props: IProps) => {
	const { width = 100, height = 100, heading } = props

	const centerX = width / 2
	const centerY = width / 2

	const circleRadius = 16

	const triangleWidth = 30
	const triangleHeight = 22
	const triangleDepth = -7
	const triangleTopY = centerY - circleRadius - triangleHeight - triangleDepth

	const trianglePoints = `
    ${centerX},${triangleTopY}   
    ${centerX - triangleWidth / 2},${triangleTopY + triangleHeight} 
    ${centerX + triangleWidth / 2},${triangleTopY + triangleHeight}
  `

	return (
		<Svg width={width} height={height} fill="none" viewBox={`0 0 ${width} ${height}`} {...props}>
			{typeof heading === 'number' && (
				<G transform={`rotate(${heading}, ${centerX}, ${centerY})`}>
					<Polygon points={trianglePoints} fill="#FFF" strokeWidth={0} />
				</G>
			)}

			<Circle
				cx={centerX}
				cy={centerY}
				r={circleRadius}
				fill={Colors['green-main']}
				strokeWidth={3}
				stroke="#FFF"
			/>
		</Svg>
	)
}

export default UserWithCircleSvg
