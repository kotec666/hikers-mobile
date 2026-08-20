import React from 'react'
import { Dimensions, Pressable, View } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import PostSliderItem from '@/components/ui/Post/PostSliderItem'
import { useFullscreenMap } from '@/hooks/useFullscreenMap'
import FullscreenMap from '@/components/map/FullscreenMap'
import type { IYaMapWorkoutProps } from '@/components/map/YaMapWorkout'
import type { IRNMapWorkoutProps } from '@/components/map/RNMapWorkout'
import { useFullscreenImageViewer } from '@/hooks/useFullscreenImageViewer'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'

type MapElement = React.ReactElement<IYaMapWorkoutProps> | React.ReactElement<IRNMapWorkoutProps>

interface IProps {
	postId?: string
	firstElement?: MapElement | null
	images?: string[]
}
type FlatListItem = { id: string; isCustom: true } | string

const { width, height } = Dimensions.get('screen')
const SLIDE_ASPECT_RATIO = height / 3.83

const PostListItemSlider = (props: IProps) => {
	const scrollX = useSharedValue(0)

	const { open: openViewer, viewer } = useFullscreenImageViewer()
	const { isVisible, open, close } = useFullscreenMap()

	const handleOpenViewer = (index: number) => {
		if (props.firstElement && index === 0) {
			open()
			return
		}

		let realIndex = index

		if (props.firstElement) {
			realIndex--
		}

		if (realIndex < 0) return

		const realImages = props.images?.map((image) => `${PATH_TO_IMAGE}${image}`)
		openViewer(realImages || [], realIndex)
	}

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
			return (
				<Pressable
					onPress={() => handleOpenViewer(index)}
					style={{
						width: width - minusWidth,
						height: SLIDE_ASPECT_RATIO
					}}
				>
					{props.firstElement}
				</Pressable>
			)
		}

		return (
			<PostSliderItem
				key={index}
				postId={props.postId}
				image={item as string}
				width={width - minusWidth}
				SLIDE_ASPECT_RATIO={SLIDE_ASPECT_RATIO}
				isOnlyOneInList={flatListData.length === 1}
				onPress={() => handleOpenViewer(index)}
			/>
		)
	}

	return (
		<>
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
			<FullscreenMap visible={isVisible} onClose={close} map={props.firstElement} />
			{viewer}
		</>
	)
}

export default PostListItemSlider
