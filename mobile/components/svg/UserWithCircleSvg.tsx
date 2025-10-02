import * as React from 'react'
import Svg, { Circle, Path } from 'react-native-svg'
import { StyleProp, ViewStyle } from 'react-native'
import { Colors } from '@/constants/Colors'

interface IProps {
	className?: string
	width?: number
	height?: number
	style?: StyleProp<ViewStyle>
}

const SvgComponent = (props: IProps) => {
	const { width = 30, height = 30 } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 33 33" {...props}>
			<Circle cx={16} cy={16} r={16} fill={Colors['green-main']} />
			<Path
				stroke="#000"
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M21 21c0-.93 0-1.396-.118-1.774a2.71 2.71 0 0 0-1.834-1.778c-.39-.115-.87-.115-1.83-.115h-3.437c-.96 0-1.439 0-1.83.115a2.71 2.71 0 0 0-1.833 1.778C10 19.604 10 20.07 10 21m8.594-9c0 1.657-1.385 3-3.094 3-1.709 0-3.094-1.343-3.094-3s1.385-3 3.094-3c1.709 0 3.094 1.343 3.094 3Z"
			/>
		</Svg>
	)
}
export default SvgComponent
