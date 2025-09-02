import React from 'react'
import { View } from 'react-native'
import { Colors } from '@/constants/Colors'
import PostListItemHeader from '@/components/ui/Post/PostListItemHeader'
import PostListItemBottom from '@/components/ui/Post/PostListItemBottom'
import PostListItemBody from '@/components/ui/Post/PostListItemBody'

const PostListItem = () => {
	return (
		<View
			className="gap-[15px]"
			style={{ paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: Colors['black-44'] }}
		>
			<PostListItemHeader isSubscribed />
			<PostListItemBody />
			<PostListItemBottom />
		</View>
	)
}

export default PostListItem
