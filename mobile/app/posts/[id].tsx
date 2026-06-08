import React, { useCallback, useEffect, useState } from 'react'
import { View, ScrollView, Dimensions, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import PostListItemHeader from '@/components/ui/Post/PostListItemHeader'
import HeaderBack, { RoundedButton } from '@/components/ui/HeaderBack'
import PostBodyWrapper, { PostType } from '@/components/ui/Post/PostBodyWrapper'
import PostListItemBottom from '@/components/ui/Post/PostListItemBottom'
import PostListItemSlider from '@/components/ui/Post/PostListItemSlider'
import DeletePostModal from '@/components/ui/Post/DeletePostModal'
import MoreOptionsSvg from '@/components/svg/MoreOptionsSvg'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import { VIEWWORKOUT_MODE } from '@/app/training/viewWorkout'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Colors } from '@/constants/Colors'
import BlurProvider from '@/components/providers/BlurProvider'
import { useDeletePostMutation, usePostQuery } from '@/queries/posts'
import { Page } from '@/components/ui/Page'
import WorkoutMap from '@/components/map/WorkoutMap'
import PopupMenuItem from '@/components/ui/Popup/PopupMenuItem'
import PopupMenu from '@/components/ui/Popup/PopupMenu'

const { height } = Dimensions.get('screen')
const SLIDE_ASPECT_RATIO = height / 3.6

const Post = () => {
	const router = useRouter()
	const { push } = useSafeNavigation()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { user } = useAuthStore()

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

	const { data: post, error, isError, isFetching } = usePostQuery(id)

	const handleClickBack = useCallback(() => {
		if (router.canGoBack()) {
			router.back()
		} else {
			router.push('/(tabs)/profile')
		}
	}, [router])

	useEffect(() => {
		if (!isError) return
		handleClickBack()
	}, [error, isError, handleClickBack])

	const handleOpenDeleteModal = () => {
		return setIsDeleteModalOpen((prevState) => !prevState)
	}

	const { mutateAsync } = useDeletePostMutation()
	const handleClickDeletePost = async () => {
		const result = await mutateAsync(id)
		if (result.success) {
			router.back()
		}
	}

	const creatorMetrics = post?.training.participants.find(
		(participant) => participant.user.id === post?.userCreator.id
	)?.metrics

	if (isFetching) {
		return (
			<View className="flex-1 items-center justify-center">
				<ActivityIndicator size="large" color={Colors['green-main']} />
			</View>
		)
	}

	return (
		<Page>
			<BlurProvider>
				<View style={{ flex: 1, alignItems: 'center' }}>
					<DeletePostModal
						open={isDeleteModalOpen}
						handleClickDeletePost={handleClickDeletePost}
						handleClose={handleOpenDeleteModal}
					/>
					<Container className="gap-[20px]">
						<View className="flex-row justify-between items-center">
							<HeaderBack returnCallback={handleClickBack}>Просмотр поста</HeaderBack>
							{post?.userCreator?.id === user?.id && (
								<PopupMenu
									menuWidth={150}
									menuHeight={150}
									trigger={({ open }) => <RoundedButton onPress={open} icon={<MoreOptionsSvg />} />}
								>
									<PopupMenuItem
										title="Редактировать"
										onPress={() =>
											push(
												`/training/viewWorkout?mode=${VIEWWORKOUT_MODE.EDIT}&editPostId=${post?.id}`
											)
										}
									/>
									<PopupMenuItem title="Удалить" onPress={handleOpenDeleteModal} />
								</PopupMenu>
							)}
						</View>
						<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 20 }}>
							<View className="gap-[15px]">
								<PostListItemHeader
									isMyPost={post?.userCreator.id === user?.id}
									subscribeData={{
										authorId: post?.userCreator.id,
										isSubscribed: post?.isSubscribed
									}}
									avatar={post?.userCreator.avatarFilename}
									authorId={post?.userCreator.id}
									authorName={post?.userCreator?.name}
									createdAt={post?.createdAt}
									workoutType={post?.training?.type}
								/>
								<PostBodyWrapper
									mode={PostType.POST_ITEM}
									title={post?.title}
									description={post?.description}
									metrics={creatorMetrics}
									isDetail
									mapComponent={
										<WorkoutMap
											key={post?.training?.participants?.[0]?.route?.points?.length || 0} // какое-то время points undefined
											bordered
											rounded={25}
											needFinishMarker
											needFitInitialRoute
											interactiveDisabled
											maxContainerHeight={SLIDE_ASPECT_RATIO}
											initialLocations={adaptLocations(
												post?.training?.participants?.[0]?.route?.points || []
											)}
										/>
									}
								/>
								{/*<MapRoutesSwitchers />*/}
								<PostListItemSlider images={post?.fileNames} />
								{post?.isLiked !== undefined &&
									post?.likesCount !== undefined &&
									post?.id !== undefined && (
										<PostListItemBottom
											postId={post.id}
											isLiked={post.isLiked}
											likesCount={post.likesCount}
											participants={post?.training.participants}
										/>
									)}
							</View>
						</ScrollView>
					</Container>
				</View>
			</BlurProvider>
		</Page>
	)
}

export default Post
