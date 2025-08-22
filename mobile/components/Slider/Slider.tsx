import { Dimensions, ImageSourcePropType, StyleSheet, Text, View, ViewToken } from 'react-native';
import { SliderItem } from '@/components/Slider/SliderItem';
import Animated, {
	useAnimatedRef,
	useAnimatedScrollHandler,
	useDerivedValue,
	useSharedValue,
	scrollTo,
} from 'react-native-reanimated';
import { SliderPagination } from '@/components/Slider/SliderPagination';
import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { fontFamily } from '@/constants/Fonts';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';

export interface SliderProps extends PropsWithChildren {
	itemList: ImageSliderType[];
}

export type ImageSliderType = {
	image: ImageSourcePropType;
	title: string;
	description: string;
};

const { width } = Dimensions.get('screen');

export function Slider({ itemList, children }: SliderProps) {
	const scrollX = useSharedValue(0);
	const [paginationIndex, setPaginationIndex] = useState(0);
	const [data, setData] = useState(itemList);
	const flatListRef = useAnimatedRef<Animated.FlatList<any>>();
	const [isAutoPlay, setIsAutoPlay] = useState(true);
	const interval = useRef<NodeJS.Timeout | undefined>(undefined);
	const offset = useSharedValue(0);
	const AUTOPLAY_INTERVAL = 5000;

	const onScrollHandler = useAnimatedScrollHandler({
		onScroll: (e) => {
			scrollX.value = e.contentOffset.x;
		},
		onMomentumEnd: (e) => {
			offset.value = e.contentOffset.x;
		},
	});

	useEffect(() => {
		if (isAutoPlay) {
			interval.current = setInterval(() => {
				offset.value = offset.value + width;
			}, AUTOPLAY_INTERVAL);
		} else {
			clearInterval(interval.current);
		}

		return () => {
			clearInterval(interval.current);
		};
	}, [isAutoPlay, offset, width]);

	useDerivedValue(() => {
		scrollTo(flatListRef, offset.value, 0, true);
	});

	const viewabilityConfig = {
		itemVisiblePercentThreshold: 50,
	};

	const onViewableItemsChanged = ({ viewableItems }: { viewableItems: ViewToken[] }) => {
		if (viewableItems[0].index !== undefined && viewableItems[0].index !== null) {
			setPaginationIndex(viewableItems[0].index % itemList.length);
		}
	};

	const viewabilityConfigCallbackPairs = useRef([{ viewabilityConfig, onViewableItemsChanged }]);

	return (
		<View className="flex-1">
			<Animated.FlatList
				className="flex-grow-0"
				ref={flatListRef}
				data={data}
				renderItem={({ item, index }) => <SliderItem item={item} index={index} />}
				horizontal
				showsHorizontalScrollIndicator={false}
				pagingEnabled
				onScroll={onScrollHandler}
				scrollEventThrottle={16}
				viewabilityConfigCallbackPairs={viewabilityConfigCallbackPairs.current}
				onEndReached={() => setData([...data, ...itemList])}
				onEndReachedThreshold={0.5}
				onScrollBeginDrag={() => setIsAutoPlay(false)}
				onScrollEndDrag={() => setIsAutoPlay(true)}
			/>

			<View className="my-[30px]">
				<SliderPagination items={itemList} paginationIndex={paginationIndex} scrollX={scrollX} />
			</View>

			<Container className="flex-1 justify-between">
				<Text className="text-[19px] text-center text-gray-ab" style={styles.descriptionText}>
					{data[paginationIndex].description}
				</Text>
				{children}
			</Container>
		</View>
	);
}

const styles = StyleSheet.create({
	descriptionText: {
		fontFamily: fontFamily.regular,
	},
});
