import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = ({ color = '#000', size = 24 }: IProps) => (
	<Svg width={size} height={size} fill="none" viewBox="0 0 24 24">
		<Path
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.33}
			d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
		/>
	</Svg>
)
export default SvgComponent
