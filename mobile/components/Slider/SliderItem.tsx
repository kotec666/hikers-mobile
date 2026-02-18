import { Dimensions, Image, Platform, StyleSheet, View } from 'react-native'
import { ImageSliderType } from '@/components/Slider/Slider'
import { fontFamily } from '@/constants/Fonts'
import { Motion } from '@legendapp/motion'

export type SliderItemProps = {
	item: ImageSliderType
	index: number
	activeIndex: number
	total: number
}

const { width, height } = Dimensions.get('screen')
const ITEM_CONTAINER_HEIGHT = Platform.select({
	ios: height / 1.7,
	android: height / 1.65,
	default: height / 2 // 135px
})

// const BOTTOM_OVERLAY_HEIGHT = ITEM_CONTAINER_HEIGHT * 0.2 // 20%

export function SliderItem({ item, index, activeIndex, total }: SliderItemProps) {
	const normalizedIndex = index % total
	const isActive = normalizedIndex === activeIndex

	return (
		<View className="justify-center items-center" style={styles.itemContainer}>
			<View>
				<Image source={item.image} style={styles.image} />
				<View className="absolute bottom-[20px] left-[20px]">
					<Motion.Text
						animate={{
							opacity: isActive ? 1 : 0,
							y: isActive ? 0 : 20
						}}
						transition={{
							type: 'spring',
							delay: isActive ? 0.1 : 0,
							damping: 18,
							stiffness: 120
						}}
						className="text-white text-[39px]"
						style={styles.titleText}
					>
						{item.title}
					</Motion.Text>
				</View>
			</View>
		</View>
	)
}

const styles = StyleSheet.create({
	itemContainer: {
		width: width,
		height: ITEM_CONTAINER_HEIGHT
	},
	image: {
		width,
		flex: 1
	},
	titleText: {
		fontFamily: fontFamily.bold,
		textShadowColor: 'rgba(0,0,0,0.75)',
		textShadowOffset: { width: 1, height: 1 },
		textShadowRadius: 2
	},
	descriptionText: {
		fontFamily: fontFamily.regular
	}
})
