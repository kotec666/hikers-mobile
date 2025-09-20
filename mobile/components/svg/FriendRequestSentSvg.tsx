import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={26} height={26} fill="none">
		<Path
			stroke="#fff"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.6}
			d="M13 12.5 8.727 9.117c-.635-.502-.952-.754-1.18-1.062a2.788 2.788 0 0 1-.444-.9C7 6.793 7 6.4 7 5.616V3m6 9.5 4.273-3.383c.635-.502.952-.754 1.18-1.062.203-.273.353-.577.444-.9C19 6.793 19 6.4 19 5.616V3m-6 9.5-4.273 3.383c-.635.502-.952.754-1.18 1.062a2.789 2.789 0 0 0-.444.9C7 18.207 7 18.6 7 19.384V22m6-9.5 4.273 3.383c.635.502.952.754 1.18 1.062.203.273.353.577.444.9.103.363.103.756.103 1.54V22M5 3h16M5 22h16"
		/>
	</Svg>
)
export default SvgComponent
