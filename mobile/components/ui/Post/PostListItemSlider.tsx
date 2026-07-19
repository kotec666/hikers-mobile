import React, { useState } from 'react'
import { Dimensions, Pressable, FlatList, Modal, View, Text } from 'react-native'
import Animated, { useAnimatedScrollHandler, useSharedValue } from 'react-native-reanimated'
import PostSliderItem from '@/components/ui/Post/PostSliderItem'
import { Image } from 'expo-image'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { Colors } from '@/constants/Colors'
import { GestureViewer, useGestureViewerController, useGestureViewerState } from 'react-native-gesture-image-viewer'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import CloseFullscreenModeButton from '@/components/ui/CloseFullscreenModeButton'
import { useFullscreenMap } from '@/hooks/useFullscreenMap'
import FullscreenMap from '@/components/map/FullscreenMap'
import ArrowDownSvg from '@/components/svg/ArrowDownSvg'
import { IYaMapWorkoutProps } from '@/components/map/YaMapWorkout'
import { IRNMapWorkoutProps } from '@/components/map/RNMapWorkout'

type MapElement = React.ReactElement<IYaMapWorkoutProps> | React.ReactElement<IRNMapWorkoutProps>

interface IProps {
	firstElement?: MapElement | null
	images?: string[]
}
type FlatListItem = { id: string; isCustom: true } | string

const { width, height } = Dimensions.get('screen')
const SLIDE_ASPECT_RATIO = height / 3.83

const PostListItemSlider = (props: IProps) => {
	const scrollX = useSharedValue(0)

	const { isVisible, open, close } = useFullscreenMap()
	const [visible, setVisible] = useState(false)
	const [selectedIndex, setSelectedIndex] = useState(0)
	const [showExternalUI, setShowExternalUI] = useState(true)
	const insets = useSafeAreaInsets()

	const { goToPrevious, goToNext } = useGestureViewerController()
	const { currentIndex, totalCount } = useGestureViewerState()

	const openViewer = (index: number) => {
		if (props.firstElement && index === 0) {
			open()
			return
		}

		let realIndex = index

		if (props.firstElement) {
			realIndex = index - 1
		}

		if (realIndex < 0) return

		setSelectedIndex(realIndex)
		setShowExternalUI(true)
		setVisible(true)
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
					onPress={() => openViewer(index)}
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
				image={item as string}
				width={width - minusWidth}
				SLIDE_ASPECT_RATIO={SLIDE_ASPECT_RATIO}
				isOnlyOneInList={flatListData.length === 1}
				onPress={() => openViewer(index)}
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
			<Modal visible={visible} animationType="none">
				<View style={{ flex: 1, backgroundColor: 'black' }}>
					<GestureViewer
						data={props.images || []}
						initialIndex={selectedIndex}
						onDismiss={() => setVisible(false)}
						onDismissStart={() => setShowExternalUI(false)}
						enableLoop
						ListComponent={FlatList}
						backdropStyle={{ backgroundColor: Colors['black-0d'] }}
						renderItem={(image) => (
							<Image
								source={{ uri: `${PATH_TO_IMAGE}${image}` }}
								style={{ width: '100%', height: '100%' }}
								contentFit="contain"
							/>
						)}
						renderContainer={(children, helpers) => (
							<View style={{ flex: 1 }}>
								{children}
								{showExternalUI && (
									<CloseFullscreenModeButton insetTop={insets.top} onPress={helpers.dismiss} />
								)}
							</View>
						)}
					/>

					{showExternalUI && (
						<View
							style={{
								position: 'absolute',
								left: 0,
								right: 0,
								bottom: insets.bottom + 10,
								zIndex: 1000
							}}
						>
							<View
								style={{
									flexDirection: 'row',
									justifyContent: 'space-around',
									alignItems: 'center'
								}}
							>
								<Pressable onPress={goToPrevious}>
									<ArrowDownSvg style={{ transform: [{ rotate: '90deg' }] }} size={30} />
								</Pressable>

								<Text style={{ color: 'white' }}>
									{currentIndex + 1} / {totalCount}
								</Text>

								<Pressable onPress={goToNext}>
									<ArrowDownSvg style={{ transform: [{ rotate: '270deg' }] }} size={30} />
								</Pressable>
							</View>
						</View>
					)}
				</View>
			</Modal>
		</>
	)
}

export default PostListItemSlider
