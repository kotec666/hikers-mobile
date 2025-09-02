import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={17} height={17} fill="none">
		<Path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M8.5 2v13M2 8.5h13" />
	</Svg>
)
export default SvgComponent
