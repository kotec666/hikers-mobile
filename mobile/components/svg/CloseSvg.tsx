import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={13} height={13} fill="none">
		<Path
			stroke="#fff"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.564}
			d="m10.582 3-8 8m0-8 8 8"
		/>
	</Svg>
)
export default SvgComponent
