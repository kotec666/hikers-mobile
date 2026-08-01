import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = ({ color = '#fff', size = 20 }: IProps) => (
	<Svg width={size} height={size} fill="none">
		<Path
			fill={color}
			d="M12 4.024a2.012 2.012 0 0 1-2 2.024c-1.105 0-2-.906-2-2.024C8 2.906 8.895 2 10 2s2 .906 2 2.024ZM12 10.5a2.012 2.012 0 0 1-2 2.024c-1.105 0-2-.906-2-2.024 0-1.118.895-2.024 2-2.024s2 .906 2 2.024ZM12 16.976A2.012 2.012 0 0 1 10 19c-1.105 0-2-.906-2-2.024 0-1.117.895-2.024 2-2.024s2 .906 2 2.024Z"
		/>
	</Svg>
)
export default SvgComponent
