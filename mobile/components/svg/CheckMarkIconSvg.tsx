import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	width?: number
	height?: number
}

const SvgComponent = (props: IProps) => {
	const { width = 17, height = 17 } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 17 17">
			<Path stroke="#000" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m15 4-8.938 9L2 8.91" />
		</Svg>
	)
}
export default SvgComponent
