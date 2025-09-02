import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import { SvgProps } from 'react-native-svg/src/elements/Svg'

const SvgComponent = (props: SvgProps) => (
	<Svg width={22} height={22} fill="none" {...props}>
		<Path
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.564}
			d="M3 11h4.444M3 11a8 8 0 0 0 8 8m-8-8a8 8 0 0 1 8-8m-3.556 8h7.112m-7.112 0c0 4.418 1.592 8 3.556 8m-3.556-8c0-4.418 1.592-8 3.556-8m3.556 8H19m-4.444 0c0-4.418-1.592-8-3.556-8m3.556 8c0 4.418-1.592 8-3.556 8m8-8a8 8 0 0 0-8-8m8 8a8 8 0 0 1-8 8"
		/>
	</Svg>
)
export default SvgComponent
