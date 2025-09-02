import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={17} height={17} fill="none">
		<Path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 4-8.938 9L2 8.91" />
	</Svg>
)
export default SvgComponent
