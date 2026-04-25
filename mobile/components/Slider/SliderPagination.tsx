import { Dimensions, View } from 'react-native'
import { ImageSliderType } from '@/components/Slider/Slider'
import Animated, { Extrapolation, interpolate, SharedValue, useAnimatedStyle } from 'react-native-reanimated'
import { Colors } from '@/constants/Colors'

export type SliderPaginationProps = {
	items: ImageSliderType[]
	paginationIndex: number
	scrollX: SharedValue<number>
}

type SliderPaginationDotProps = {
	idx: number
	isActive: boolean
	scrollX: SharedValue<number>
	totalItems: number
}

const { width } = Dimensions.get('screen')

function SliderPaginationDot({ idx, isActive, scrollX, totalItems }: SliderPaginationDotProps) {
	const pgAnimationStyle = useAnimatedStyle(() => {
		const dotWidth = interpolate(
			scrollX.value % (totalItems * width),
			[(idx - 1) * width, idx * width, (idx + 1) * width],
			[6, 20, 8],
			Extrapolation.CLAMP
		)

		return {
			width: dotWidth
		}
	})

	return (
		<Animated.View
			style={[pgAnimationStyle, { backgroundColor: isActive ? Colors['green-main'] : Colors['gray-d9'] }]}
			className="w-[6px] h-[6px] rounded-[6px] mx-[4px]"
		/>
	)
}

export function SliderPagination({ items, paginationIndex, scrollX }: SliderPaginationProps) {
	return (
		<View className="flex-row justify-center items-center gap-[5px]">
			{items.map((_, idx) => (
				<SliderPaginationDot
					key={idx}
					idx={idx}
					isActive={paginationIndex === idx}
					scrollX={scrollX}
					totalItems={items.length}
				/>
			))}
		</View>
	)
}
