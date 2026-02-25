import React from 'react'
import { View } from 'react-native'
import { Colors } from '@/constants/Colors'
import PostListItemHeader from '@/components/ui/Post/PostListItemHeader'
import PostListItemBottom from '@/components/ui/Post/PostListItemBottom'
import PostBodyWrapper, { PostType } from '@/components/ui/Post/PostBodyWrapper'
import { TrainingType } from '@shared/enums'
import { ITrainingMetrics } from '@/api/workout'
import { IParticipant } from '@/api/posts'

interface IProps {
	isMyPost?: boolean
	postId?: string
	authorId?: string
	authorName?: string
	createdAt?: string
	avatar?: string | null
	workoutType: TrainingType
	title?: string
	description?: string | null
	metrics?: ITrainingMetrics
	subscribeData?: {
		authorId: string
		isSubscribed?: boolean
	}
	likeData?: {
		isLiked: boolean
		postId: string
		likesCount: number
	}
	participants?: IParticipant[]
	onToggleSubscribeCallback?: (isSubscribed: boolean, authorId?: string) => void
	mapComponent?: React.ReactNode
	images?: string[]
	isDetail?: boolean
}

const PostListItem = (props: IProps) => {
	return (
		<View
			className="gap-[15px]"
			style={{ paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: Colors['black-44'] }}
		>
			<PostListItemHeader
				isMyPost={props.isMyPost}
				subscribeData={props.subscribeData}
				avatar={props.avatar}
				authorId={props.authorId}
				authorName={props.authorName}
				createdAt={props.createdAt}
				workoutType={props.workoutType}
				onToggleSubscribeCallback={props.onToggleSubscribeCallback}
			/>
			<PostBodyWrapper
				mode={PostType.FEED_LIST_ITEM}
				postId={props.postId}
				title={props.title}
				description={props.description}
				metrics={props.metrics}
				images={props.images}
				mapComponent={props.mapComponent}
				isDetail={props.isDetail}
			/>
			<PostListItemBottom postId={props.postId} likeData={props.likeData} participants={props.participants} />
		</View>
	)
}

export default PostListItem
