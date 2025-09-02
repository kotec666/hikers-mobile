import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
}

const SvgComponent = (props: IProps) => (
	<Svg width={28} height={28} fill="none">
		<Path
			stroke={props.color || '#FFFFFF'}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.6}
			d="M14.151 9.05v9.4m-4.7-4.7h9.4m7.05 0c0 6.49-5.26 11.75-11.75 11.75-6.489 0-11.75-5.26-11.75-11.75S7.662 2 14.151 2c6.49 0 11.75 5.26 11.75 11.75Z"
		/>
	</Svg>
)
export default SvgComponent
