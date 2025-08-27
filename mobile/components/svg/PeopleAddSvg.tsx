import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={25} height={25} fill="none">
		<Path
			stroke="#fff"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2.4}
			d="M12.5 16.194H7.775c-1.465 0-2.198 0-2.794.182a4.211 4.211 0 0 0-2.8 2.815C2 19.791 2 20.527 2 22m17.85 0v-6.333m-3.15 3.166H23M15.125 7.75c0 2.623-2.116 4.75-4.725 4.75-2.61 0-4.725-2.127-4.725-4.75S7.79 3 10.4 3c2.61 0 4.725 2.127 4.725 4.75Z"
		/>
	</Svg>
)
export default SvgComponent
