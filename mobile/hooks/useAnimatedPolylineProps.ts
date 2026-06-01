import { processColor, SharedValue, useAnimatedProps } from 'react-native-reanimated'

const withOpacity = (color: string, opacity: number) => {
	'worklet'

	const values = color.match(/\d+/g)

	if (!values || values.length < 3) {
		return color
	}

	return `rgba(${values[0]}, ${values[1]}, ${values[2]}, ${opacity})`
}

export const useAnimatedPolylineProps = (currentColor: SharedValue<string>, opacity = 1) => {
	return useAnimatedProps(
		() => ({
			strokeColor: opacity === 1 ? currentColor.value : withOpacity(currentColor.value, opacity)
		}),
		[],
		(props) => {
			'worklet'

			if ('strokeColor' in props) {
				props.strokeColor = processColor(props.strokeColor)
			}
		}
	)
}
