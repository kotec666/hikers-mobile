import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from '@/constants/Colors'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = (props: IProps) => {
	const { size = 24, color = Colors['gray-a1'] } = props

	return (
		<Svg width={size} height={size} fill="none">
			<Path
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M6 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
			/>
			<Path
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 19h8.5a3.5 3.5 0 1 0 0-7h-11a3.5 3.5 0 1 1 0-7H15"
			/>
			<Path
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
			/>
		</Svg>
	)
}
export default SvgComponent
