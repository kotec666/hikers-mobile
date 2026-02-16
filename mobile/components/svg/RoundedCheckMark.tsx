import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string | null
	width?: number
	height?: number
}

const SvgComponent = (props: IProps) => {
	const { width = 25, height = 25 } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 25 25">
			<Path
				stroke={props.color || '#FFF'}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="m7.775 12.5 3.15 3.15 6.3-6.3M23 12.5C23 18.299 18.299 23 12.5 23S2 18.299 2 12.5 6.701 2 12.5 2 23 6.701 23 12.5Z"
			/>
		</Svg>
	)
}
export default SvgComponent
