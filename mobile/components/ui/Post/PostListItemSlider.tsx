import React from 'react'
import { Dimensions, View } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import PostSliderItem from '@/components/ui/Post/PostSliderItem'

interface IProps {
	firstElement?: React.ReactNode
	images?: string[]
}
type FlatListItem = { id: string; isCustom: true } | string

const { width, height } = Dimensions.get('screen')
const SLIDE_ASPECT_RATIO = height / 3.83

const PostListItemSlider = (props: IProps) => {
	const scrollX = useSharedValue(0)

	const onScrollHandler = useAnimatedScrollHandler({
		onScroll: (event) => {
			scrollX.value = event.contentOffset.x
		}
	})

	const flatListData: FlatListItem[] = props.firstElement
		? [{ id: 'custom-first', isCustom: true }, ...(props.images || [])]
		: props.images || []

	const renderItem = ({ item, index }: { item: FlatListItem; index: number }) => {
		const minusWidth = flatListData.length > 1 ? 64 : 32 // когда один в списке - 32; когда много - 64

		if (typeof item === 'object' && 'isCustom' in item && item.isCustom) {
			return <View style={{ width: width - minusWidth, height: SLIDE_ASPECT_RATIO }}>{props.firstElement}</View>
		}

		return (
			<PostSliderItem
				key={index}
				image={item as string}
				width={width - minusWidth}
				SLIDE_ASPECT_RATIO={SLIDE_ASPECT_RATIO}
				isOnlyOneInList={flatListData.length === 1}
			/>
		)
	}

	return (
		<Animated.FlatList
			onTouchStart={(e) => e.stopPropagation()}
			className="flex-grow-0"
			data={flatListData}
			renderItem={renderItem}
			horizontal
			showsHorizontalScrollIndicator={false}
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
