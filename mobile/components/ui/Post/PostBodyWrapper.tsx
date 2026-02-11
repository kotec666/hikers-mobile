import React from 'react'
import { TouchableOpacity, View } from 'react-native'
import PostListItemSlider from '@/components/ui/Post/PostListItemSlider'
import { useRouter } from 'expo-router'
import PostListItemBody from '@/components/ui/Post/PostListItemBody'
import { ITrainingMetrics } from '@/api/workout'

export enum PostType {
	FEED_LIST_ITEM = 'FEED_LIST_ITEM',
	POST_ITEM = 'POST_ITEM'
}

interface IProps {
	mode: PostType
	postId?: string
	title?: string
	description?: string | null
	metrics?: ITrainingMetrics
}

const PostBodyWrapper = (props: IProps) => {
	const router = useRouter()
	const PostSliderItems = [
		{ id: 1, image: require('@/assets/images/carousel/carousel-2.webp') },
		{ id: 2, image: require('@/assets/images/carousel/carousel-2.webp') },
		{ id: 3, image: require('@/assets/images/carousel/carousel-2.webp') }
	]

	const IS_FEED_LIST_ITEM = props.mode === 'FEED_LIST_ITEM'

	return (
		<>
			{IS_FEED_LIST_ITEM ? (
				<>
					<TouchableOpacity onPress={() => router.push(`/news-feed/${props.postId}`)}>
						<PostListItemBody title={props.title} description={props.description} metrics={props.metrics} />
					</TouchableOpacity>
					<View>
						<PostListItemSlider data={PostSliderItems} />
					</View>
				</>
			) : (
				<PostListItemBody />
			)}
		</>
	)
}

export default PostBodyWrapper
