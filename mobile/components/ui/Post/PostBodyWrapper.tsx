import React from 'react'
import { Pressable, TouchableOpacity, View } from 'react-native'
import PostListItemSlider from '@/components/ui/Post/PostListItemSlider'
import PostListItemBody from '@/components/ui/Post/PostListItemBody'
import { ITrainingMetrics } from '@/api/workout'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useFullscreenMap } from '@/hooks/useFullscreenMap'
import FullscreenMap from '@/components/map/FullscreenMap'
import { IYaMapWorkoutProps } from '@/components/map/YaMapWorkout'
import { IRNMapWorkoutProps } from '@/components/map/RNMapWorkout'

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
	mapComponent?: React.ReactElement<IYaMapWorkoutProps> | React.ReactElement<IRNMapWorkoutProps>
	isDetail?: boolean
}

const PostBodyWrapper = (props: IProps) => {
	const { push } = useSafeNavigation()
	const IS_FEED_LIST_ITEM = props.mode === 'FEED_LIST_ITEM' // Из ленты либо детальный просмотр
	const { isVisible, open, close } = useFullscreenMap()

	const MapSlide = props.mapComponent ? props.mapComponent : null

	return (
		<>
			{IS_FEED_LIST_ITEM ? (
				<>
					<TouchableOpacity
						onPress={() =>
							push({
								pathname: '/posts/[id]',
								params: { id: props.postId! }
							})
						}
					>
						<PostListItemBody
							title={props.title}
							description={props.description}
							metrics={props.metrics}
							isDetail={props.isDetail}
						/>
					</TouchableOpacity>
					<View>
						<PostListItemSlider images={props.images} firstElement={MapSlide} postId={props.postId} />
					</View>
				</>
			) : (
				<>
					<PostListItemBody
						title={props.title}
						description={props.description}
						metrics={props.metrics}
						isDetail={props.isDetail}
					/>
					{props.mapComponent && (
						<Pressable className="flex-1" onPress={open}>
							{props.mapComponent}
						</Pressable>
					)}
					<FullscreenMap visible={isVisible} onClose={close} map={props.mapComponent} />
				</>
			)}
		</>
	)
}

export default PostBodyWrapper
