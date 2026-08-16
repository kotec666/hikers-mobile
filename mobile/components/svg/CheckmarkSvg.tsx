import React, { useEffect } from 'react'
import Svg, { Path } from 'react-native-svg'
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated'

const AnimatedPath = Animated.createAnimatedComponent(Path)

interface IProps {
	size?: number
	color?: string
}

const SvgComponent = ({ size = 12, color = '#000' }: IProps) => {
	const pathLength = size
	const progress = useSharedValue(0)

	useEffect(() => {
		progress.value = withTiming(1, { duration: 500 })
	}, [progress])

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: pathLength * (1 - progress.value)
	}))

	return (
		<Svg width={size} height={size} fill="none" viewBox="0 0 12 12">
			<AnimatedPath
				d="M2 6.727 L4.5 9 L10 4"
				stroke={color}
				strokeWidth={1.6}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeDasharray={pathLength}
				animatedProps={animatedProps}
			/>
		</Svg>
	)
}

export default SvgComponent
