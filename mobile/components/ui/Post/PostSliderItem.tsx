import React from 'react'
import { Dimensions, Image, ImageSourcePropType, View } from 'react-native'

const { width, height } = Dimensions.get('screen')

const PostSliderItem = (props: { index: number; image: ImageSourcePropType; isOnlyOneInList: boolean }) => {
	// container padding = paddingLeft 16px + paddingRight 16px
	const SliderContainerItemWidth = props.isOnlyOneInList ? width - 32 : width - 64
	const SLIDE_ASPECT_RATIO = height / 3.83

	return (
		<View style={{ width: SliderContainerItemWidth }}>
			<Image
				style={{ height: SLIDE_ASPECT_RATIO }}
				source={props.image}
				className="rounded-[25px] border-[1px] border-white/20 w-full"
				resizeMode="cover"
			/>
		</View>
	)
}

export default PostSliderItem
