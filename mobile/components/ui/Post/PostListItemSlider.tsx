import React from 'react'
import { Dimensions, ImageSourcePropType, View } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import PostSliderItem from '@/components/ui/Post/PostSliderItem'

interface IProps {
	data: { id: number; image: ImageSourcePropType }[]
}

const { width } = Dimensions.get('screen')

const PostListItemSlider = (props: IProps) => {
	const scrollX = useSharedValue(0)

	const onScrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x
		}
	})

	return (
		<Animated.FlatList
			onTouchStart={(e) => e.stopPropagation()}
			className="flex-grow-0"
			data={props.data}
			renderItem={({ item, index }) => (
				<PostSliderItem key={item.id} {...item} index={index} isOnlyOneInList={props.data.length === 1} />
			)}
			horizontal
			showsHorizontalScrollIndicator={false}
			//pagingEnabled
			snapToInterval={width - 64 + 16}
			decelerationRate="fast"
			bounces={false}
			onScroll={onScrollHandler}
			scrollEventThrottle={16}
			ItemSeparatorComponent={() => <View style={{ width: 16 }} />}
		/>
	)
}

export default PostListItemSlider
