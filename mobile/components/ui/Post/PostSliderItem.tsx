import React from 'react'
import { Image, View } from 'react-native'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'

const PostSliderItem = (props: {
	image: string
	isOnlyOneInList: boolean
	width: number
	SLIDE_ASPECT_RATIO: number
}) => {
	// container padding = paddingLeft 16px + paddingRight 16px

	return (
		<View style={{ width: props.width }}>
			<Image
				style={{ height: props.SLIDE_ASPECT_RATIO }}
				source={{ uri: `${PATH_TO_IMAGE}${props.image}` }}
				className="rounded-[25px] border-[1px] border-white/20 w-full"
				resizeMode="cover"
			/>
		</View>
	)
}

export default PostSliderItem
