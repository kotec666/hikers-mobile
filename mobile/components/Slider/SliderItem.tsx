import { Dimensions, Image, Platform, StyleSheet, Text, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { ImageSliderType } from '@/components/Slider/Slider'
import { fontFamily } from '@/constants/Fonts'

export type SliderItemProps = {
	item: ImageSliderType
	index: number
}

const { width, height } = Dimensions.get('screen')
const ITEM_CONTAINER_HEIGHT = Platform.select({
	ios: height / 1.7,
	android: height / 1.65,
	default: height / 2 // 135px
})

// const BOTTOM_OVERLAY_HEIGHT = ITEM_CONTAINER_HEIGHT * 0.2 // 20%

export function SliderItem({ item }: SliderItemProps) {
	return (
		<View className="justify-center items-center" style={styles.itemContainer}>
			<View>
				<Image source={item.image} style={styles.image} />
				<View className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 135 }}>
					<Image
						source={item.image}
						style={[styles.image, { position: 'absolute', bottom: 0 }]}
						resizeMode="cover"
						blurRadius={1}
					/>
				</View>

				<LinearGradient
					colors={['transparent', 'rgba(0,0,0,0.65)']}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					style={StyleSheet.absoluteFill}
				/>

				<View className="absolute bottom-[20px] left-[20px]">
					<Text className="text-white text-[39px]" style={styles.titleText}>
						{item.title}
					</Text>
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
