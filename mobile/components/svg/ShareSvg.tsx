import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={25} height={25} fill="none">
		<Path
			stroke="#fff"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.6}
			d="m8.9 14.085 7.21 4.18m-.01-11.53-7.2 4.18M22 5.15c0 1.74-1.418 3.15-3.167 3.15a3.158 3.158 0 0 1-3.166-3.15c0-1.74 1.417-3.15 3.166-3.15A3.158 3.158 0 0 1 22 5.15ZM9.333 12.5c0 1.74-1.417 3.15-3.166 3.15A3.158 3.158 0 0 1 3 12.5c0-1.74 1.418-3.15 3.167-3.15a3.158 3.158 0 0 1 3.166 3.15ZM22 19.85c0 1.74-1.418 3.15-3.167 3.15a3.158 3.158 0 0 1-3.166-3.15c0-1.74 1.417-3.15 3.166-3.15A3.158 3.158 0 0 1 22 19.85Z"
		/>
	</Svg>
)
export default SvgComponent
