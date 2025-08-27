import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={36} height={36} fill="none">
		<Path
			stroke="#fff"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2.4}
			d="M30.291 17.927c0 6.909-5.6 12.51-12.51 12.51m12.51-12.51c0-6.908-5.6-12.509-12.51-12.509m12.51 12.51h3.127M17.782 30.435c-6.909 0-12.51-5.6-12.51-12.509m12.51 12.51v3.127M5.272 17.927c0-6.908 5.601-12.509 12.51-12.509m-12.51 12.51H2.147m15.636-12.51V2.291m4.69 15.636a4.69 4.69 0 1 1-9.381 0 4.69 4.69 0 0 1 9.382 0Z"
		/>
	</Svg>
)
export default SvgComponent
