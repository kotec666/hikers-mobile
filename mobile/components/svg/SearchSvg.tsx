import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={19} height={19} fill="none">
		<Path
			stroke="#fff"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.6}
			d="m17 17-3.625-3.625m1.958-4.708A6.667 6.667 0 1 1 2 8.667a6.667 6.667 0 0 1 13.333 0Z"
		/>
	</Svg>
)
export default SvgComponent
