import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from '@/constants/Colors'

interface IProps {
	color?: string
	width?: number
	height?: number
}

const SvgComponent = (props: IProps) => {
	const { width = 24, height = 24 } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 24 24" {...props}>
			<Path
				stroke={props.color || Colors['white']}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M4 16.242A4.5 4.5 0 0 1 6.08 8.02a6.002 6.002 0 0 1 11.84 0A4.5 4.5 0 0 1 20 16.242M8 16l4-4m0 0 4 4m-4-4v9"
			/>
		</Svg>
	)
}
export default SvgComponent
