import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import { SvgProps } from 'react-native-svg/src/elements/Svg'

const SvgComponent = (props: SvgProps) => {
	const { stroke = 'black', ...restProps } = props

	return (
		<Svg width={22} height={22} fill="none" {...restProps}>
			<Path
				stroke={stroke}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M18 19c0-1.24 0-1.86-.15-2.366a3.528 3.528 0 0 0-2.334-2.37c-.497-.153-1.107-.153-2.329-.153H8.814c-1.222 0-1.832 0-2.329.153a3.528 3.528 0 0 0-2.333 2.37C4 17.14 4 17.76 4 19M14.938 7c0 2.21-1.763 4-3.938 4-2.175 0-3.938-1.79-3.938-4S8.825 3 11 3c2.175 0 3.938 1.79 3.938 4Z"
			/>
		</Svg>
	)
}
export default SvgComponent
