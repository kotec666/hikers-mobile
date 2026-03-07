import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	width?: number
	height?: number
}

const SvgComponent = (props: IProps) => {
	const { width = 26, height = 26 } = props

	return (
		<Svg width={width} height={height} viewBox="0 0 26 26" fill="none" {...props}>
			<Path
				stroke="#000"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2.699}
				d="m19.67 8.037-8.71 8.71L7 12.789"
			/>
		</Svg>
	)
}
export default SvgComponent
