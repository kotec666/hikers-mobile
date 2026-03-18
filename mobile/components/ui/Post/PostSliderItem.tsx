import React from 'react'
import { Image, View, Pressable } from 'react-native'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'

const PostSliderItem = (props: {
	image: string
	isOnlyOneInList: boolean
	width: number
	SLIDE_ASPECT_RATIO: number
	onPress: () => void
}) => {
	// container padding = paddingLeft 16px + paddingRight 16px

	return (
		<View style={{ width: props.width }}>
			<Pressable onPress={props.onPress}>
				<Image
					style={{ height: props.SLIDE_ASPECT_RATIO }}
					source={{ uri: `${PATH_TO_IMAGE}${props.image}` }}
					className="rounded-[25px] border-[1px] border-white/20 w-full"
					resizeMode="cover"
				/>
			</Pressable>
		</View>
	)
}

export default PostSliderItem
