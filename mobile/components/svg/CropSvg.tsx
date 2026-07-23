import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = ({ color = '#fff', size = 30 }: IProps) => (
	<Svg width={size} height={size} fill="none" viewBox="0 0 30 30">
		<Path
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M12.5 7.5h6c1.4 0 2.1 0 2.635.272a2.5 2.5 0 0 1 1.092 1.093c.273.535.273 1.235.273 2.635v6m-20-10h5m15 15v5m5-5h-16c-1.4 0-2.1 0-2.635-.273a2.5 2.5 0 0 1-1.093-1.092C7.5 20.6 7.5 19.9 7.5 18.5v-16"
		/>
	</Svg>
)
export default SvgComponent
