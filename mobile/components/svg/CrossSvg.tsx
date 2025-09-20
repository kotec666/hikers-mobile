import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={12} height={12} fill="none">
		<Path stroke="#fff" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.564} d="m10 2-8 8m0-8 8 8" />
	</Svg>
)
export default SvgComponent
