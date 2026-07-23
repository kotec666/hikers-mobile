import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'

interface IProps {
	color?: string
	size?: number
	style?: StyleProp<ViewStyle>
}

const SvgComponent = ({ color = '#fff', style, size = 28 }: IProps) => (
	<Svg width={size} height={size} fill="none" viewBox="0 0 28 28" style={style}>
		<Path
			// style={{ transform: [{ rotate: '90deg' }] }}
			stroke={color}
			strokeLinecap="round"
			strokeLinejoin="round"
			strokeWidth={2}
			d="M9.333 3.5h-3.5A2.333 2.333 0 0 0 3.5 5.833v16.334A2.34 2.34 0 0 0 5.833 24.5h3.5M18.667 3.5h3.5A2.333 2.333 0 0 1 24.5 5.833v16.334a2.333 2.333 0 0 1-2.333 2.333h-3.5M14 23.334v2.333M14 16.334v2.333M14 9.334v2.333M14 2.333v2.334"
		/>
	</Svg>
)
export default SvgComponent
