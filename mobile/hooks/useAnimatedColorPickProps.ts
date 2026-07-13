import { processColor, SharedValue, useAnimatedProps } from 'react-native-reanimated'

const withOpacity = (color: string, opacity: number) => {
	'worklet'

	const rgb = color.match(/\d+/g)

	if (!rgb) return color

	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`
}

export const useAnimatedColorPickProps = (
	fieldName: string,
	processNative: boolean,
	currentColor: SharedValue<string>,
	opacity = 1
) => {
	return useAnimatedProps(() => {
		const color = opacity === 1 ? currentColor.value : withOpacity(currentColor.value, opacity)

		return {
			[fieldName]: processNative ? processColor(color) : color
		}
	})
}
