import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
}

const SvgComponent = (props: IProps) => {
	return (
		<Svg width={27} height={27} fill="none">
			<Path
				stroke={props.color || '#FFFFFF'}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M9.05 13.75h9.4m7.05 0c0 6.49-5.26 11.75-11.75 11.75S2 20.24 2 13.75 7.26 2 13.75 2 25.5 7.26 25.5 13.75Z"
			/>
		</Svg>
	)
}
export default SvgComponent
