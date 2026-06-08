import * as React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = (props: IProps) => {
	const { size = 30, color = '#22CB5A' } = props
	const center = size / 2
	const strokeWidth = 3
	const radius = (size - strokeWidth) / 2

	return (
		<Svg width={size} height={size} fill="none">
			<Circle cx={center} cy={center} r={radius} stroke={color} strokeWidth={strokeWidth} />
			<Path
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.5}
				d="M20 18v-6m-3 3h6M7 15h6"
			/>
		</Svg>
	)
}
export default SvgComponent
