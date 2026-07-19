import * as React from 'react'
import Svg, { Circle } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = (props: IProps) => {
	const { size = 22, color = '#fff' } = props
	const center = size / 2
	const strokeWidth = 5
	const radius = (size - strokeWidth) / 2
	return (
		<Svg width={size} height={size} fill="none">
			<Circle cx={center} cy={center} r={radius} stroke={color} strokeWidth={strokeWidth} />
		</Svg>
	)
}
export default SvgComponent
