import {Dimensions, View} from 'react-native';
import {ImageSliderType} from "@/components/Slider/Slider";
import Animated, {Extrapolation, interpolate, SharedValue, useAnimatedStyle} from "react-native-reanimated";
import {Colors} from "@/constants/Colors";

export type SliderPaginationProps = {
    items: ImageSliderType[]
    paginationIndex: number
    scrollX: SharedValue<number>
}

const {width} = Dimensions.get('screen')

export function SliderPagination({items, paginationIndex, scrollX}: SliderPaginationProps) {
    return (
        <View className="flex-row justify-center items-center gap-[5px]">
            {items.map((_, idx) => {
                const pgAnimationStyle = useAnimatedStyle(() => {
                    const dotWidth = interpolate(
                       scrollX.value % (items.length * width),
                        [(idx - 1) * width, idx * width, (idx + 1) * width],
                        [6, 20, 8],
                        Extrapolation.CLAMP
                    )

                    return {
                        width: dotWidth
                    }
                })

                return (
                    <Animated.View key={idx}
                          style={[
                              pgAnimationStyle,
                              { backgroundColor: paginationIndex === idx ? Colors['green-main'] : Colors['gray-d9'] }
                          ]}
                          className="w-[6px] h-[6px] rounded-[6px] mx-[4px]"
                    />
                )
            })}
        </View>
    )
}

