import * as React from 'react'
import Svg, { Circle, Polygon, G } from 'react-native-svg'
import { Colors } from '@/constants/Colors'

interface IProps {
	width?: number
	height?: number
	heading: number | null
}

const UserWithCircleSvg = React.memo((props: IProps) => {
	const { width = 100, height = 100, heading } = props

	const { centerX, centerY, viewBox } = React.useMemo(() => {
		const cx = width / 2
		const cy = height / 2
		return {
			centerX: cx,
			centerY: cy,
			viewBox: `0 0 ${width} ${height}`
		}
	}, [width, height])

	const trianglePoints = React.useMemo(() => {
		const circleRadius = 16
		const triangleWidth = 30
		const triangleHeight = 22
		const triangleDepth = -7

		const topY = centerY - circleRadius - triangleHeight - triangleDepth

		return `
			${centerX},${topY}
			${centerX - triangleWidth / 2},${topY + triangleHeight}
			${centerX + triangleWidth / 2},${topY + triangleHeight}
		`
	}, [centerX, centerY])

	const rotationTransform = React.useMemo(() => {
		if (typeof heading === 'number') {
			return `rotate(${heading}, ${centerX}, ${centerY})`
		}
		return undefined
	}, [heading, centerX, centerY])

	return (
		<Svg width={width} height={height} viewBox={viewBox}>
			{rotationTransform && (
				<G transform={rotationTransform}>
					<Polygon points={trianglePoints} fill="#FFF" strokeWidth={0} />
				</G>
			)}

			<Circle cx={centerX} cy={centerY} r={16} fill={Colors['green-main']} strokeWidth={3} stroke="#FFF" />
		</Svg>
	)
})

UserWithCircleSvg.displayName = 'UserWithCircleSvg'

export default UserWithCircleSvg
