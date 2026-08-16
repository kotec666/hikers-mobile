import React, { useCallback, useEffect, useState } from 'react'
import { View, ScrollView, Dimensions } from 'react-native'
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
import { VIEW_WORKOUT_MODE } from '@/app/training/viewWorkout'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Colors } from '@/constants/Colors'
import BlurProvider from '@/components/providers/BlurProvider'
import { useDeletePostMutation, usePostQuery } from '@/queries/posts'
import { Page } from '@/components/ui/Page'
import WorkoutMap from '@/components/map/WorkoutMap'
import EditSvg from '@/components/svg/EditSvg'
import DeleteTrashSvg from '@/components/svg/DeleteTrashSvg'
import LoadQueryErrorRetry from '@/components/LoadQueryErrorRetry'
import { PostItemSkeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'
import { Menu } from '@/components/ui/Menu/Menu'

const { height } = Dimensions.get('screen')
const SLIDE_ASPECT_RATIO = height / 3.6

const Post = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const { push } = useSafeNavigation()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { user } = useAuthStore()

	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

	const { data: post, error, isError, isLoading, refetch: refetchPost } = usePostQuery(id)

	const handleRetryPost = useCallback(() => {
		return refetchPost()
	}, [refetchPost])

	const handleClickBack = useCallback(() => {
		if (router.canGoBack()) {
			router.back()
		} else {
			router.push('/(tabs)/profile')
		}
	}, [router])

	useEffect(() => {
		if (!isError || !error) return

		// Если пост не найден / нет доступа — уходим назад
		// Если это временная/сетевая ошибка — не редиректим, покажем retry
		const status = (error as any)?.response?.status
		const isNotFoundOrForbidden = status === 404 || status === 403

		if (isNotFoundOrForbidden) {
			handleClickBack()
		}
	}, [error, handleClickBack, isError, router])

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

	const postCreator = post?.training.participants.find((participant) => participant.user.id === post?.userCreator.id)
	const creatorMetrics = postCreator?.metrics
	const creatorColor = postCreator?.user.color

	if (isError && !post) {
		return (
			<View className="flex-1 items-center justify-center px-4">
				<LoadQueryErrorRetry
					text={t('LoadQueryErrorRetry.label.failedToLoadPost')}
					buttonText={t('LoadQueryErrorRetry.action.tryAgain')}
					onRetry={handleRetryPost}
				/>
			</View>
		)
	}

	if (isLoading) {
		return (
			<Page>
				<View style={{ flex: 1 }}>
					<Container className="gap-[20px] flex-1">
						<HeaderBack returnCallback={handleClickBack}>{t('PostDetailsPage.header')}</HeaderBack>
						<ScrollView style={{ flex: 1, width: '100%' }} contentContainerStyle={{ paddingBottom: 20 }}>
							<PostItemSkeleton />
						</ScrollView>
					</Container>
				</View>
			</Page>
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
							<HeaderBack returnCallback={handleClickBack}>{t('PostDetailsPage.header')}</HeaderBack>
							{post?.userCreator?.id === user?.id && (
								<Menu
									menuWidth={170}
									menuHeight={150}
									actions={[
										{
											id: 'edit',
											title: t('common.edit'),
											image: 'square.and.pencil',
											icon: <EditSvg size={18} color="white" />,
											onPress: () => {
												push(
													`/training/viewWorkout?mode=${VIEW_WORKOUT_MODE.EDIT}&editPostId=${post?.id}`
												)
											}
										},
										{
											id: 'delete',
											title: t('common.delete'),
											image: 'trash',
											destructive: true,
											icon: <DeleteTrashSvg size={18} color={Colors['red-ff4']} />,
											onPress: handleOpenDeleteModal
										}
									]}
								>
									<RoundedButton icon={<MoreOptionsSvg />} />
								</Menu>
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
									postId={post?.id}
								/>
								<PostBodyWrapper
									postId={post?.id}
									mode={PostType.POST_ITEM}
									title={post?.title}
									description={post?.description}
									metrics={creatorMetrics}
									isDetail
									mapComponent={
										<WorkoutMap
											bordered
											rounded={25}
											needFinishMarker
											needFitInitialRoute
											interactiveDisabled
											routeColor={creatorColor}
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
