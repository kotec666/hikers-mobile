import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = ({ color = '#fff', size = 24 }: IProps) => (
	<Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
		<Path
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M10 8H5V3m.291 13.357a8 8 0 1 0 .188-8.991"
		/>
	</Svg>
)
export default SvgComponent
