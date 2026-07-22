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
			d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
		/>
		<Path
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.33}
			d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5Z"
		/>
	</Svg>
)
export default SvgComponent
