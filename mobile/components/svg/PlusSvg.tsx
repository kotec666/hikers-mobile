import * as React from 'react'
import Svg, { Path } from 'react-native-svg'

interface IProps {
	color?: string
	size?: number
}

const SvgComponent = (props: IProps) => {
	const { size = 24, color = '#fff' } = props

	return (
		<Svg width={size} height={size} fill="none">
			<Path stroke={color} strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 12h14M12 5v14" />
		</Svg>
	)
}
export default SvgComponent
