import React, { useEffect } from 'react'
import Svg, { Path } from 'react-native-svg'
import Animated, { useSharedValue, useAnimatedProps, withTiming } from 'react-native-reanimated'

const AnimatedPath = Animated.createAnimatedComponent(Path)

const SvgComponent = () => {
	const pathLength = 12
	const progress = useSharedValue(0)

	useEffect(() => {
		progress.value = withTiming(1, { duration: 500 })
	}, [progress])

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: pathLength * (1 - progress.value)
	}))

	return (
		<Svg width={12} height={12} fill="none">
			<AnimatedPath
				d="M2 6.727 L4.5 9 L10 4"
				stroke="#000"
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
