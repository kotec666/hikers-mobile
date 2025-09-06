import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'

interface IProps {
	width?: number
	height?: number
	style?: StyleProp<ViewStyle>
}

const SvgComponent = (props: IProps) => {
	const { width = 25, height = 25 } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 25 25" style={props.style}>
			<Path
				stroke="#fff"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M3 12.5 9.536 19M3 12.5 9.536 6M3 12.5h20"
			/>
		</Svg>
	)
}
export default SvgComponent
