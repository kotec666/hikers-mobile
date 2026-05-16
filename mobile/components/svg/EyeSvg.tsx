import * as React from 'react'
import Svg, { Path } from 'react-native-svg'
import Animated, { useSharedValue, withTiming, useAnimatedProps } from 'react-native-reanimated'

type Props = {
	color?: string
	opened: boolean
}

const AnimatedPath = Animated.createAnimatedComponent(Path)

const SvgComponent = ({ color = '#FFFFFF', opened }: Props) => {
	const progress = useSharedValue(opened ? 0 : 1) // 1 = линия видна, 0 = скрыта

	React.useEffect(() => {
		progress.value = withTiming(opened ? 0 : 1, { duration: 300 })
	}, [opened, progress])

	const dashLength = 32

	const animatedProps = useAnimatedProps(() => ({
		strokeDashoffset: dashLength * (1 - progress.value)
	}))

	return (
		<Svg width={28} height={28} fill="none">
			<Path
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M2.322 15.366c-.166-.262-.25-.393-.296-.595a1.419 1.419 0 0 1 0-.542c.047-.202.13-.333.296-.595C3.694 11.47 7.777 6 14 6c6.223 0 10.306 5.47 11.678 7.634.166.262.25.393.296.595.035.151.035.39 0 .542-.047.202-.13.333-.296.595C24.306 17.53 20.223 23 14 23c-6.223 0-10.306-5.47-11.678-7.634Z"
			/>
			<Path
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				d="M14 18.143a3.65 3.65 0 0 0 3.657-3.643A3.65 3.65 0 0 0 14 10.857a3.65 3.65 0 0 0-3.657 3.643A3.65 3.65 0 0 0 14 18.143Z"
			/>

			<AnimatedPath
				stroke={color}
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={1.6}
				strokeDasharray={dashLength}
				animatedProps={animatedProps}
				d="M3.029 4l21.942 22"
			/>
		</Svg>
	)
}

export default SvgComponent
