import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string | null
	width?: number
	height?: number
}

const SvgComponent = (props: IProps) => {
	const { width = 28, height = 28 } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 28 28">
			<Path
				stroke={props.color || '#FFF'}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M14.151 9.05v9.4m-4.7-4.7h9.4m7.05 0c0 6.49-5.26 11.75-11.75 11.75-6.489 0-11.75-5.26-11.75-11.75S7.662 2 14.151 2c6.49 0 11.75 5.26 11.75 11.75Z"
			/>
		</Svg>
	)
}
export default SvgComponent
