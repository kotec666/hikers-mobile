import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import { Colors } from '@/constants/Colors'
import Animated from 'react-native-reanimated'

interface IProps {
	color?: string
	width?: number
	height?: number
	animatedStrokeProps?: Partial<{ stroke: string }>
}

const AnimatedPath = Animated.createAnimatedComponent(Path)
const SvgComponent = (props: IProps) => {
	const { width = 14, height = 14, animatedStrokeProps, color = Colors['green-main'] } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 14 14">
			<AnimatedPath
				stroke={color}
				animatedProps={animatedStrokeProps}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M3 8.48s.498-.5 1.994-.5c1.495 0 2.492.998 3.987.998s1.994-.499 1.994-.499V2.997s-.499.498-1.994.498-2.492-.997-3.987-.997C3.498 2.498 3 2.997 3 2.997m0 8.971V2"
			/>
		</Svg>
	)
}
export default SvgComponent
