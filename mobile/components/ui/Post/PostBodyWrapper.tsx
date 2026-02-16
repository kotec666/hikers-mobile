import React from 'react'
import { Dimensions, TouchableOpacity, View } from 'react-native'
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
	images?: string[]
	metrics?: ITrainingMetrics
	mapComponent?: React.ReactNode
}

const PostBodyWrapper = (props: IProps) => {
	const router = useRouter()
	const IS_FEED_LIST_ITEM = props.mode === 'FEED_LIST_ITEM' // Из ленты либо детальный просмотр

	const MapSlide = props.mapComponent ? props.mapComponent : null

	return (
		<>
			{IS_FEED_LIST_ITEM ? (
				<>
					<TouchableOpacity onPress={() => router.push(`/news-feed/${props.postId}`)}>
						<PostListItemBody title={props.title} description={props.description} metrics={props.metrics} />
					</TouchableOpacity>
					<View>
						<PostListItemSlider images={props.images} firstElement={MapSlide} />
					</View>
				</>
			) : (
				<>
					<PostListItemBody title={props.title} description={props.description} metrics={props.metrics} />
					{props.mapComponent}
				</>
			)}
		</>
	)
}

export default PostBodyWrapper
