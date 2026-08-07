import React, { useEffect, useState, useCallback, useRef } from 'react'
import { ActivityIndicator, Platform, RefreshControl, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import SocialStats from '@/components/ui/Profile/SocialStats'
import { Button } from '@/components/ui/Button'
import RedirectAchievementsInfo from '@/components/ui/Profile/RedirectAchievementsInfo'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import PostListItem from '@/components/ui/Post/PostListItem'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import Modal from '@/components/ui/Modal/Modal'
import { FriendStatus } from '@shared/enums'
import { AnimatedProfilePicture } from '@/components/ui/Profile/AnimatedProfilePicture'
import { IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import BlurProvider from '@/components/providers/BlurProvider'
import HeaderBack from '@/components/ui/HeaderBack'
import { useUserProfileQuery } from '@/queries/user-profile'
import { useNotMyProfilePostsQuery } from '@/queries/posts'
import {
	useAcceptFriendRequestMutation,
	useRemoveFriendMutation,
	useRevokeRequestMutation,
	useSendFriendRequestMutation
} from '@/queries/friends'
import { useToggleSubscribeMutation } from '@/queries/subscriptions'
import { Page } from '@/components/ui/Page'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WorkoutMap from '@/components/map/WorkoutMap'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import LoadQueryErrorRetry from '@/components/LoadQueryErrorRetry'
import { PostListItemSkeleton, ProfileHeaderSkeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

/**
 *
 * Чужой профиль
 *
 * */

const friendStatusLabel = {
	[FriendStatus.FALSE]: 'UserProfilePage.friendStatus.addAsFriend',
	[FriendStatus.TRUE]: 'UserProfilePage.friendStatus.deleteFriend',
	[FriendStatus.INVITED]: 'UserProfilePage.friendStatus.inviteFriend',
	[FriendStatus.SENT]: 'UserProfilePage.friendStatus.acceptFriend'
}

const UserProfilePage = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const { id } = useLocalSearchParams<{ id: string }>()
	const flashListRef = useRef<FlashListRef<IPost>>(null)

	const [isDeleteModalOpened, setIsDeleteModalOpened] = useState<boolean>(false)

	const {
		data: profileData,
		error,
		isError: isProfileError,
		isLoading: isProfileLoading,
		refetch: refetchProfile,
		isFetching: isProfileFetching
	} = useUserProfileQuery(id)

	const { mutateAsync: acceptFriend, isPending: isAcceptPending } = useAcceptFriendRequestMutation()
	const { mutateAsync: removeFriend, isPending: isRemoveFriendPending } = useRemoveFriendMutation()
	const { mutateAsync: sendRequest, isPending: isSendRequestPending } = useSendFriendRequestMutation()
	const { mutateAsync: revokeRequest, isPending: isRevokeRequestPending } = useRevokeRequestMutation()

	// Общее состояние загрузки для действий с друзьями
	const isFriendActionPending =
		isAcceptPending || isRemoveFriendPending || isSendRequestPending || isRevokeRequestPending

	const {
		data: posts = [],
		fetchNextPage: fetchNextPostsPage,
		hasNextPage: hasNextPostsPage,
		isFetchingNextPage: isFetchingPostsNextPage,
		refetch: postsRefetch,
		isRefetching: postsIsRefetching,
		isLoading: isPostsLoading,
		isError: isPostsError
	} = useNotMyProfilePostsQuery(id)

	const { mutateAsync: toggleSubscribe, isPending: isPendingSubscribe } = useToggleSubscribeMutation()

	useEffect(() => {
		if (!isProfileError || !error) return

		// Если профиль не найден / нет доступа — уходим назад
		// Если это временная/сетевая ошибка — не редиректим, покажем retry
		const status = (error as any)?.response?.status
		const isNotFoundOrForbidden = status === 404 || status === 403

		if (isNotFoundOrForbidden) {
			if (router.canGoBack()) {
				router.back()
			} else {
				router.push('/(tabs)/profile')
			}
		}
	}, [error, isProfileError, router])

	const onRefreshAll = useCallback(async () => {
		await Promise.all([refetchProfile(), postsRefetch()])
	}, [refetchProfile, postsRefetch])

	const handleRetryProfile = useCallback(() => {
		return refetchProfile()
	}, [refetchProfile])

	const handleRetryPosts = useCallback(() => {
		return postsRefetch()
	}, [postsRefetch])

	const handleDeleteFromFriends = async () => {
		try {
			await removeFriend(id)
		} catch {
		} finally {
			setIsDeleteModalOpened(false)
		}
	}

	const handleCloseDeleteModal = () => {
		setIsDeleteModalOpened(false)
	}

	const handleSendFriendRequest = async () => await sendRequest(id)
	const handleRevokeFriendRequest = async () => await revokeRequest(id)
	const handleAcceptFriendRequest = async () => await acceptFriend(id)

	const handleFriendAction = async () => {
		if (isFriendActionPending) return
		switch (profileData?.isFriend) {
			case FriendStatus.TRUE:
				setIsDeleteModalOpened(true)
				break
			case FriendStatus.FALSE:
				await handleSendFriendRequest()
				break
			case FriendStatus.INVITED:
				await handleRevokeFriendRequest()
				break
			case FriendStatus.SENT:
				await handleAcceptFriendRequest()
				break
			default:
				break
		}
	}

	const handleSubscribe = useCallback(
		async (userId: string, isSubscribed: boolean) => {
			await toggleSubscribe({
				userId,
				isSubscribed
			})
		},
		[toggleSubscribe]
	)

	const renderPostItem = useCallback(({ item }: { item: IPost }) => {
		return (
			<PostListItem
				key={item.id}
				{...item}
				postId={item.id}
				authorId={item.userCreator?.id || ''}
				authorName={item.userCreator?.name || ''}
				avatar={item.userCreator.avatarFilename}
				createdAt={item.createdAt}
				workoutType={item.training.type}
				title={item.title}
				description={item.description}
				images={item.fileNames}
				metrics={
					item.training.participants.find((participant) => participant.user.id === item.userCreator.id)
						?.metrics
				}
				subscribeData={{
					authorId: item.userCreator.id,
					isSubscribed: item.isSubscribed
				}}
				isLiked={item.isLiked}
				likesCount={item.likesCount}
				participants={item.training.participants}
				mapComponent={
					<WorkoutMap
						bordered
						rounded={25}
						needFinishMarker
						needFitInitialRoute
						interactiveDisabled
						routeColor={item.userCreator.color}
						initialLocations={adaptLocations(item.training.participants[0].route.points)}
					/>
				}
			/>
		)
	}, [])

	// Определяем вариант кнопки
	const getButtonVariant = () => {
		const isFriend = profileData?.isFriend
		if (isFriend === FriendStatus.TRUE || isFriend === FriendStatus.INVITED) {
			return 'black'
		}
		return 'white'
	}

	const renderFooter = useCallback(() => {
		if (isPostsError && posts.length > 0) {
			return (
				<LoadQueryErrorRetry
					text={t('LoadQueryErrorRetry.label.cantLoadMore')}
					buttonText={t('LoadQueryErrorRetry.action.retry')}
					onRetry={handleRetryPosts}
				/>
			)
		}
		if (!isFetchingPostsNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [isPostsError, posts.length, isFetchingPostsNextPage, t, handleRetryPosts])

	const renderEmpty = useCallback(() => {
		if (isPostsLoading) {
			return (
				<View className="gap-8">
					<PostListItemSkeleton />
					<PostListItemSkeleton />
				</View>
			)
		}

		if (isPostsError) {
			return (
				<LoadQueryErrorRetry
					text={t('LoadQueryErrorRetry.label.failedToLoadPublications')}
					buttonText={t('LoadQueryErrorRetry.action.tryAgain')}
					onRetry={handleRetryPosts}
				/>
			)
		}

		return null
	}, [isPostsLoading, isPostsError, t, handleRetryPosts])

	return (
		<Page edges={['top']}>
			<BlurProvider>
				<FlashList
					ref={flashListRef}
					data={posts}
					renderItem={renderPostItem}
					keyExtractor={(item) => item.id}
					onEndReached={() => {
						if (hasNextPostsPage && !isFetchingPostsNextPage) {
							fetchNextPostsPage()
						}
					}}
					onEndReachedThreshold={0.5}
					ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={renderEmpty}
					refreshControl={
						<RefreshControl
							refreshing={isProfileFetching || postsIsRefetching}
							onRefresh={() => refetchAndHaptics(onRefreshAll)}
							tintColor={Colors['green-main']}
						/>
					}
					ListHeaderComponent={
						<>
							<Modal
								isOpen={isDeleteModalOpened}
								handleClose={handleCloseDeleteModal}
								label={t('UserProfilePage.deleteFriendText')}
							>
								<View className="gap-[20px]">
									<Text className="text-white text-sm" style={{ fontFamily: fontFamily.bold }}>
										{t('common.actionCannotBeUndone')}
									</Text>
									<View className="flex-row gap-[10px]">
										<Button
											onPress={handleDeleteFromFriends}
											variant="white"
											buttonContainerClassName="flex-1"
											isLoading={isRemoveFriendPending}
										>
											{t('common.yes')}
										</Button>
										<Button
											onPress={handleCloseDeleteModal}
											variant="white"
											buttonContainerClassName="flex-1"
										>
											{t('common.no')}
										</Button>
									</View>
								</View>
							</Modal>
							<View className="gap-[20px] mb-[16px]">
								<HeaderBack>{t('UserProfilePage.header')}</HeaderBack>

								{isProfileLoading ? (
									<View className="gap-[20px]">
										<ProfileHeaderSkeleton />
									</View>
								) : isProfileError && !profileData ? (
									<View className="flex-1 items-center justify-center px-4">
										<LoadQueryErrorRetry
											text={t('LoadQueryErrorRetry.label.failedToLoadProfile')}
											buttonText={t('LoadQueryErrorRetry.action.tryAgain')}
											onRetry={handleRetryProfile}
										/>
									</View>
								) : (
									<>
										<View className="gap-[20px]">
											<View className="gap-[20px]">
												<View className="gap-[16px]">
													<View className="flex-row justify-between w-full">
														<AnimatedProfilePicture
															size={117}
															bordered
															imageUrl={`${PATH_TO_IMAGE}${profileData?.user?.avatarFilename}`}
														/>
														{/*<PopupMenu*/}
														{/*	menuWidth={200}*/}
														{/*	menuHeight={300}*/}
														{/*	trigger={({ open }) => (*/}
														{/*		<RoundedButton onPress={open} icon={<SettingsSvg />} />*/}
														{/*	)}*/}
														{/*>*/}
														{/*	<PopupMenuItem*/}
														{/*		title="Настройки"*/}
														{/*		onPress={() => handleClickRedirect(ALLOWED_ROUTES.SETTINGS)}*/}
														{/*	/>*/}
														{/*	<PopupMenuItem title="Выход" onPress={handleClickExit} />*/}
														{/*</PopupMenu>*/}
													</View>
													<View>
														<View className="flex-row items-center gap-3">
															{profileData?.user?.name && (
																<Text
																	className="text-[19px] text-white"
																	style={{ fontFamily: fontFamily.bold }}
																>
																	{profileData?.user?.name}
																</Text>
															)}
															{profileData?.user?.badge && (
																<Text
																	className="text-xl"
																	style={{ fontFamily: fontFamily.bold }}
																>
																	{profileData.user.badge}
																</Text>
															)}
														</View>
														{profileData?.user?.username && (
															<Text
																className="text-base text-gray-ab"
																style={{ fontFamily: fontFamily.medium }}
															>
																@{profileData?.user?.username}
															</Text>
														)}
													</View>
												</View>
												<View className="flex-row justify-between gap-[20px]">
													<SocialStats
														label={t('UserProfilePage.stats.subscribers')}
														content={profileData?.subscribers}
														// hrefTo="/subscribers/my-subscribers"
													/>
													<SocialStats
														label={t('UserProfilePage.stats.friends')}
														content={profileData?.friends}
														// hrefTo="/friends/my-friends"
													/>
													<SocialStats
														label={t('UserProfilePage.stats.subscriptions')}
														content={profileData?.subscriptions}
														// hrefTo="/subscribers/my-subscriptions"
													/>
												</View>
												<View className="flex-row gap-[10px]">
													<Button
														variant={profileData?.isSubscribed ? 'black' : 'white'}
														buttonContainerClassName="flex-1"
														onPress={async () => {
															if (!profileData?.user?.id) return
															await handleSubscribe(
																profileData.user.id,
																profileData.isSubscribed
															)
														}}
														disabled={isPendingSubscribe}
													>
														{profileData?.isSubscribed
															? t('UserProfilePage.unsubscribe')
															: t('UserProfilePage.subscribe')}
													</Button>
													<Button
														variant={getButtonVariant()}
														buttonContainerClassName="flex-1"
														onPress={handleFriendAction}
														isLoading={isFriendActionPending}
													>
														{profileData && t(friendStatusLabel[profileData?.isFriend])}
													</Button>
												</View>
												<RedirectAchievementsInfo
													achievements={profileData?.achievements}
													userId={id}
												/>
												<ActivityInfo
													label={t('UserProfilePage.activity')}
													activities={profileData?.activities || []}
												/>
											</View>
										</View>
										<Text
											className="text-base text-white border-b-[1px] border-b-black-44 py-[20px]"
											style={{ fontFamily: fontFamily.bold }}
										>
											{t('UserProfilePage.postFeed')}
										</Text>
									</>
								)}
							</View>
						</>
					}
					contentContainerStyle={{
						paddingBottom: insets.bottom + (Platform.OS === 'android' ? 100 : 40),
						paddingHorizontal: 16
					}}
				/>
			</BlurProvider>
		</Page>
	)
}

export default UserProfilePage
