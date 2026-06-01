import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import Animated from 'react-native-reanimated'

interface IProps {
	color?: string
	width?: number
	height?: number
	animatedFillProps?: Partial<{ fill: string }>
}

const AnimatedPath = Animated.createAnimatedComponent(Path)
const SvgComponent = (props: IProps) => {
	const { width = 23, height = 23, animatedFillProps } = props

	return (
		<Svg width={width} height={height} fill="none" viewBox="0 0 23 23">
			<AnimatedPath
				fill={props.color || '#000'}
				animatedProps={animatedFillProps}
				d="M18 10.268c1.333.77 1.333 2.694 0 3.464l-9 5.196c-1.333.77-3-.192-3-1.732V6.804c0-1.54 1.667-2.502 3-1.732l9 5.196Z"
			/>
		</Svg>
	)
}
export default SvgComponent
