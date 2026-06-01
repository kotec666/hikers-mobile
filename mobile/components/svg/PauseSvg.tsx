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
				d="M6 5a2 2 0 1 1 4 0v14a2 2 0 1 1-4 0V5ZM14 5a2 2 0 1 1 4 0v14a2 2 0 1 1-4 0V5Z"
			/>
		</Svg>
	)
}
export default SvgComponent
