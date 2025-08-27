import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={25} height={25} fill="none">
		<Path
			stroke="#fff"
			strokeLinecap="round"
			strokeWidth={2.4}
			d="M3.556 22h4.666M2 17.96h2.333M3.007 9.738l11.208 12.017a.764.764 0 0 0 .559.246h7.448c.43 0 .778-.362.778-.808V19.06a.89.89 0 0 0-.652-.843c-2.474-.715-6.225-3.459-5.211-8.473.129-.637-.421-1.276-1.048-1.266-2.963.047-4.208-2.526-4.604-4.679-.12-.651-.878-1.034-1.392-.64l-6.99 5.367a.828.828 0 0 0-.096 1.211Z"
		/>
	</Svg>
)
export default SvgComponent
