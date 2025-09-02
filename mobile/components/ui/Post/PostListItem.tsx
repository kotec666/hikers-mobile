import React from 'react'
import {View} from 'react-native'
import {Colors} from '@/constants/Colors'
import PostListItemHeader from '@/components/ui/Post/PostListItemHeader'
import PostListItemBottom from '@/components/ui/Post/PostListItemBottom'
import PostBodyWrapper, {PostType} from '@/components/ui/Post/PostBodyWrapper'

const PostListItem = () => {
	return (
		<View
			className="gap-[15px]"
			style={{ paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: Colors['black-44'] }}
		>
			<PostListItemHeader isSubscribed />
			<PostBodyWrapper mode={PostType.FEED_LIST_ITEM} />
			<PostListItemBottom />
		</View>
	)
}

export default PostListItem
