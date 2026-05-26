import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface Props {
	error: boolean
}

const SvgComponent = (props: Props) => (
	<Svg width={20} height={20} fill="none">
		<Path
			stroke={props.error ? '#FF0004' : '#ABABAB'}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.5}
			d="M10.833 15 6.667 5 2.5 15m6.667-3.333h-5M17.5 15v-2.5m0 0V10m0 2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0Z"
		/>
	</Svg>
)
export default SvgComponent
