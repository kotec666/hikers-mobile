import React from 'react'
import { View, Pressable } from 'react-native'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import SmartImage from '@/components/ui/SmartImage'

const PostSliderItem = (props: {
	postId?: string
	image: string
	isOnlyOneInList: boolean
	width: number
	SLIDE_ASPECT_RATIO: number
	onPress: () => void
}) => {
	// container padding = paddingLeft 16px + paddingRight 16px

	return (
		<View style={{ width: props.width }}>
			<Pressable onPress={props.onPress} style={{ borderRadius: 25, overflow: 'hidden' }}>
				<SmartImage
					style={{
						width: '100%',
						height: props.SLIDE_ASPECT_RATIO,
						borderRadius: 25,
						borderWidth: 1,
						borderColor: 'rgba(255, 255, 255, 0.2)'
					}}
					cachePolicy="memory-disk"
					recyclingKey={props.postId || props.image}
					source={{ uri: `${PATH_TO_IMAGE}${props.image}` }}
					contentFit="cover"
				/>
			</Pressable>
		</View>
	)
}

export default PostSliderItem
