import React from 'react'
import { View } from 'react-native'
import { Colors } from '@/constants/Colors'
import PostListItemHeader from '@/components/ui/Post/PostListItemHeader'
import PostListItemBottom from '@/components/ui/Post/PostListItemBottom'
import PostBodyWrapper, { PostType } from '@/components/ui/Post/PostBodyWrapper'
import { TrainingType } from '@shared/enums'
import { ITrainingMetrics } from '@/api/workout'
import { IParticipant } from '@/api/posts'
import { IYaMapWorkoutProps } from '@/components/map/YaMapWorkout'
import { IRNMapWorkoutProps } from '@/components/map/RNMapWorkout'

interface IProps {
	isMyPost?: boolean
	postId?: string
	isLiked: boolean
	likesCount: number
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
	participants?: IParticipant[]
	mapComponent?: React.ReactElement<IYaMapWorkoutProps> | React.ReactElement<IRNMapWorkoutProps>
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
				postId={props.postId}
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
			<PostListItemBottom
				postId={props.postId}
				isLiked={props.isLiked}
				likesCount={props.likesCount}
				participants={props.participants}
			/>
		</View>
	)
}

export default React.memo(PostListItem)
