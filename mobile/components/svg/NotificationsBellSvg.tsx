import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

const SvgComponent = () => (
	<Svg width={19} height={19} fill="none">
		<Path
			stroke="#fff"
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={1.6}
			d="M7.532 16.25A2.95 2.95 0 0 0 9.5 17a2.95 2.95 0 0 0 1.968-.75m2.495-9.75c0-1.193-.47-2.338-1.307-3.182A4.444 4.444 0 0 0 9.5 2a4.444 4.444 0 0 0-3.156 1.318A4.52 4.52 0 0 0 5.037 6.5c0 2.318-.58 3.905-1.227 4.954-.547.885-.82 1.328-.81 1.452.011.136.04.188.15.27.098.074.543.074 1.433.074h9.834c.89 0 1.335 0 1.434-.074.109-.082.138-.134.149-.27.01-.124-.263-.567-.81-1.452-.647-1.05-1.227-2.636-1.227-4.954Z"
		/>
	</Svg>
)
export default SvgComponent
