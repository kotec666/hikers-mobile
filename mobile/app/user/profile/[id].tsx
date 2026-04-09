import React, { useEffect, useState, useCallback, useRef } from 'react'
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import SocialStats from '@/components/ui/Profile/SocialStats'
import { Button } from '@/components/ui/Button'
import RedirectAchievementsInfo from '@/components/ui/Profile/RedirectAchievementsInfo'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import PostListItem from '@/components/ui/Post/PostListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { getUserProfileData, INotMyProfile } from '@/api/profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { subscribeToUser, unsubscribeFromUser } from '@/api/subscribers'
import { useToast } from '@/hooks/useToast'
import Modal from '@/components/ui/Modal/Modal'
import { acceptFriendRequest, addAsFriend, deleteFriendById, revokeFriendInviteByUserId } from '@/api/friends'
import { FriendStatus } from '@shared/enums'
import { AnimatedProfilePicture } from '@/components/ui/Profile/AnimatedProfilePicture'
import { LegendList, LegendListRef } from '@legendapp/list'
import { getPostsByUserId, IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import MapComponent from '@/components/map/MapComponent'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import { useOptimisticToggle } from '@/hooks/useOptimisticToggle'
import { useInfiniteQuery, useQueryClient, InfiniteData, useQuery } from '@tanstack/react-query'
import BlurProvider from '@/components/providers/BlurProvider'

/**
 *
 * Чужой профиль
 *
 * */

const friendStatusLabel = {
	[FriendStatus.FALSE]: 'Добавить в друзья',
	[FriendStatus.TRUE]: 'Удалить из друзей',
	[FriendStatus.INVITED]: 'Заявка отправлена',
	[FriendStatus.SENT]: 'Принять заявку'
}

const UserProfilePage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const router = useRouter()
	const queryClient = useQueryClient()
	const { id } = useLocalSearchParams<{ id: string }>()
	const friendActionLockRef = useRef(false)
	const legendListRef = useRef<LegendListRef>(null)

	const [isDeleteModalOpened, setIsDeleteModalOpened] = useState<boolean>(false)
	const [isFriendLoading, setIsFriendLoading] = useState(false)

	const postsLimit = 5
	const {
		data: posts = [],
		fetchNextPage: fetchNextPostsPage,
		hasNextPage: hasNextPostsPage,
		isFetchingNextPage: isFetchingPostsNextPage,
		refetch: postsRefetch,
		isRefetching: postsIsRefetching
		// isFetching: isPostsFetching для renderEmpty
	} = useInfiniteQuery<IPost[], Error, IPost[], ['posts-profile', string], number>({
		queryKey: ['posts-profile', id],
		queryFn: ({ pageParam }) =>
			getPostsByUserId(id, {
				page: pageParam,
				limit: postsLimit
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < postsLimit) return undefined
			return pages.length + 1
		},

		select: (data) => data.pages.flat()
	})

	const updatePostsSubscription = useCallback(
		(authorId: string, isSubscribed: boolean) => {
			queryClient.setQueryData<InfiniteData<IPost[]>>(['posts-profile', id], (old) => {
				if (!old) return old

				return {
					...old,
					pages: old.pages.map((page) =>
						page.map((post) => (post.userCreator.id === authorId ? { ...post, isSubscribed } : post))
					)
				}
			})
		},
		[id, queryClient]
	)

	const {
		data: profileData,
		error,
		isError,
		isFetching: isProfileFetching,
		refetch: refetchProfile
	} = useQuery<INotMyProfile>({
		queryKey: ['user-profile', id],
		queryFn: () => getUserProfileData(id),
		enabled: !!id
	})

	useEffect(() => {
		if (!isError || !error) return

		const handleError = async () => {
			await getFieldsErrors(error)

			if (router.canGoBack()) {
				router.back()
			} else {
				router.push('/(tabs)/profile')
			}
		}

		handleError()
	}, [isError, error, router])

	const onRefreshAll = useCallback(async () => {
		await Promise.all([refetchProfile(), postsRefetch()])
	}, [refetchProfile, postsRefetch])

	const {
		value: isSubscribed,
		toggle: toggleSubscribe,
		isLoading: isSubscribeLoading
	} = useOptimisticToggle({
		initialValue: profileData?.isSubscribed ?? false,
		onEnable: async () => {
			if (!profileData?.user?.id) throw new Error('Пользователь не выбран')
			await subscribeToUser(profileData.user.id)
			await queryClient.invalidateQueries({ queryKey: ['my-profile'] })
		},
		onDisable: async () => {
			if (!profileData?.user?.id) throw new Error('Пользователь не выбран')
			await unsubscribeFromUser(profileData.user.id)
			await queryClient.invalidateQueries({ queryKey: ['my-profile'] })
		},
		onError: (e) => {
			console.log(e)
			toast.error('Ошибка при подписке/отписке')
		},
		onSuccess: (val) => {
			updateProfileData((prev) => ({
				isSubscribed: val,
				subscribers: (prev.subscribers ?? 0) + (val ? 1 : -1)
			}))

			if (profileData?.user?.id) {
				updatePostsSubscription(profileData.user.id, val)
			}
		}
	})

	const updateProfileData = (updater: (prev: INotMyProfile) => Partial<INotMyProfile>) => {
		queryClient.setQueryData<INotMyProfile>(['user-profile', id], (old) => {
			if (!old) return old

			return {
				...old,
				...updater(old)
			}
		})
	}

	const subUnsubCallback = useCallback(
		(isSubscribed: boolean, authorId?: string) => {
			if (isSubscribed) {
				updateProfileData((prev) => ({
					isSubscribed: true,
					subscribers: (prev.subscribers ?? 0) + 1
				}))
			} else {
				updateProfileData((prev) => ({
					isSubscribed: false,
					subscribers: (prev.subscribers ?? 0) - 1
				}))
			}

			if (authorId) {
				updatePostsSubscription(authorId, isSubscribed)
			}
		},
		[updatePostsSubscription]
	)

	// Функция для инвалидации запросов на друзей
	const invalidateFriendQueries = useCallback(async () => {
		await queryClient.invalidateQueries({ queryKey: ['pendingInvites'] })
		// Инвалидирование других связанных запросов
		await queryClient.invalidateQueries({ queryKey: ['friendsList'] })
	}, [queryClient])

	const handleDeleteFromFriends = async () => {
		if (isFriendLoading) return
		friendActionLockRef.current = true
		setIsFriendLoading(true)
		try {
			await deleteFriendById(id)
			const friendsCount =
				typeof profileData?.friends === 'number' ? profileData.friends - 1 : profileData?.friends

			updateProfileData(() => ({
				isFriend: FriendStatus.FALSE,
				friends: friendsCount
			}))
			// Инвалидируем запросы на друзей
			await invalidateFriendQueries()
			await queryClient.invalidateQueries({ queryKey: ['my-profile'] })
			toast.success('Пользователь удалён из списка друзей')
		} catch (e: unknown) {
			toast.error('Произошла ошибка, повторите попытку позже')
			await getFieldsErrors(e)
		} finally {
			friendActionLockRef.current = false
			setIsFriendLoading(false)
			setIsDeleteModalOpened(false)
		}
	}

	const handleCloseDeleteModal = () => {
		setIsDeleteModalOpened(false)
	}

	const handleOpenDeleteModal = () => {
		setIsDeleteModalOpened(true)
	}

	const sendFriendRequest = async () => {
		if (isFriendLoading) return
		friendActionLockRef.current = true
		setIsFriendLoading(true)
		try {
			await addAsFriend(id)
			updateProfileData(() => ({
				isFriend: FriendStatus.INVITED
			}))

			// Инвалидируем запросы на друзей
			await invalidateFriendQueries()
			toast.success('Заявка в друзья отправлена')
		} catch (e: unknown) {
			toast.error('Произошла ошибка, повторите попытку позже')
			await getFieldsErrors(e)
		} finally {
			friendActionLockRef.current = false
			setIsFriendLoading(false)
		}
	}

	const revokeFriendRequest = async () => {
		if (isFriendLoading) return
		friendActionLockRef.current = true
		setIsFriendLoading(true)
		try {
			await revokeFriendInviteByUserId(id)
			updateProfileData(() => ({
				isFriend: FriendStatus.FALSE
			}))
			// Инвалидируем запросы на друзей
			await invalidateFriendQueries()
			toast.success('Заявка в друзья отозвана')
		} catch (e: unknown) {
			toast.error('Произошла ошибка, повторите попытку позже')
			await getFieldsErrors(e)
		} finally {
			friendActionLockRef.current = false
			setIsFriendLoading(false)
		}
	}

	const handleAcceptFriendRequest = async () => {
		if (isFriendLoading) return
		friendActionLockRef.current = true
		setIsFriendLoading(true)
		try {
			await acceptFriendRequest(id)
			updateProfileData(() => ({
				isFriend: FriendStatus.TRUE
			}))
			// Инвалидируем запросы на друзей
			await invalidateFriendQueries()
			await queryClient.invalidateQueries({ queryKey: ['my-profile'] })
			toast.success('Заявка в друзья принята')
		} catch (e: unknown) {
			toast.error('Произошла ошибка, повторите попытку позже')
			await getFieldsErrors(e)
		} finally {
			friendActionLockRef.current = false
			setIsFriendLoading(false)
		}
	}

	const handleClickDeleteAddFriend = async () => {
		if (isFriendLoading || friendActionLockRef.current) return
		switch (profileData?.isFriend) {
			case FriendStatus.TRUE:
				return handleOpenDeleteModal()
			case FriendStatus.FALSE:
				return sendFriendRequest()
			case FriendStatus.INVITED:
				return revokeFriendRequest()
			case FriendStatus.SENT:
				return handleAcceptFriendRequest()
		}
	}

	const renderPostItem = useCallback(
		({ item }: { item: IPost }) => {
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
					likeData={{
						isLiked: item.isLiked,
						likesCount: item.likesCount,
						postId: item.id
					}}
					participants={item.training.participants}
					onToggleSubscribeCallback={subUnsubCallback}
					mapComponent={
						<MapComponent
							rounded={25}
							interactiveDisabled
							needFinishMarker
							initialLocations={{ current: adaptLocations(item.training.participants[0].route.points) }}
						/>
					}
				/>
			)
		},
		[subUnsubCallback]
	)

	const renderFooter = useCallback(() => {
		//if (!loadingPosts) return null
		if (!isFetchingPostsNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [isFetchingPostsNextPage])

	return (
		<>
			<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
				<BlurProvider>
					<LegendList
						ref={legendListRef}
						data={posts}
						renderItem={renderPostItem}
						keyExtractor={(item) => item.id}
						// onEndReached={loadMore}
						onEndReached={() => {
							if (hasNextPostsPage && !isFetchingPostsNextPage) {
								fetchNextPostsPage()
							}
						}}
						onEndReachedThreshold={0.5}
						ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
						ListFooterComponent={renderFooter}
						refreshControl={
							<RefreshControl
								refreshing={isProfileFetching || postsIsRefetching}
								onRefresh={onRefreshAll}
								tintColor={Colors['green-main']}
							/>
						}
						ListHeaderComponent={
							<>
								<Modal
									isOpen={isDeleteModalOpened}
									handleClose={handleCloseDeleteModal}
									label="Вы действительно хотите удалить пользователя из друзей?"
								>
									<View className="gap-[20px]">
										<Text className="text-white text-sm" style={{ fontFamily: fontFamily.bold }}>
											Это действие нельзя отменить
										</Text>
										<View className="flex-row gap-[10px]">
											<Button
												onPress={handleDeleteFromFriends}
												variant="white"
												buttonContainerClassName="flex-1"
											>
												Да
											</Button>
											<Button
												onPress={handleCloseDeleteModal}
												variant="white"
												buttonContainerClassName="flex-1"
											>
												Нет
											</Button>
										</View>
									</View>
								</Modal>
								<View className="gap-[20px] mb-[16px]">
									<View className="gap-[20px]">
										<View className="gap-[20px]">
											<View className="gap-[16px]">
												<View className="flex-row justify-between w-full">
													<AnimatedProfilePicture
														size={117}
														bordered
														imageUrl={`${PATH_TO_IMAGE}${profileData?.user?.avatarFilename}`}
													/>
													{/*<MoreOptionsButton*/}
													{/*	icon={<MoreOptionsSvg />}*/}
													{/*	params={[*/}
													{/*		{ label: 'Редактировать профиль', action: () => {} },*/}
													{/*		{ label: 'Политика конфиденциальности', action: () => {} },*/}
													{/*		{ label: 'Политика обработки персональных данных', action: () => {} },*/}
													{/*		{ label: 'Выход', action: () => {} }*/}
													{/*	]}*/}
													{/*/>*/}
												</View>
												<View>
													{profileData?.user?.name && (
														<Text
															className="text-[19px] text-white"
															style={{ fontFamily: fontFamily.bold }}
														>
															{profileData?.user?.name}
														</Text>
													)}
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
													label="Подписчики"
													content={profileData?.subscribers}
													// hrefTo="/subscribers/my-subscribers"
												/>
												<SocialStats
													label="Друзья"
													content={profileData?.friends}
													// hrefTo="/friends/my-friends"
												/>
												<SocialStats
													label="Подписки"
													content={profileData?.subscriptions}
													// hrefTo="/subscribers/my-subscriptions"
												/>
											</View>
											<View className="flex-row gap-[10px]">
												<Button
													variant={isSubscribed ? 'black' : 'white'}
													buttonContainerClassName="flex-1"
													onPress={toggleSubscribe}
													disabled={isSubscribeLoading}
												>
													{isSubscribed ? 'Отписаться' : 'Подписаться'}
												</Button>
												<Button
													variant={
														profileData?.isFriend === FriendStatus.TRUE ||
														profileData?.isFriend === FriendStatus.INVITED
															? 'black'
															: 'white'
													}
													buttonContainerClassName="flex-1"
													onPress={handleClickDeleteAddFriend}
													disabled={isFriendLoading}
												>
													{isFriendLoading ? (
														<ActivityIndicator size="small" color={Colors['green-main']} />
													) : (
														profileData && friendStatusLabel[profileData?.isFriend]
													)}
												</Button>
											</View>
											<RedirectAchievementsInfo
												achievements={profileData?.achievements}
												userId={id}
											/>
											<ActivityInfo
												label="Активности"
												activities={profileData?.activities || []}
											/>
										</View>
									</View>
									<Text
										className="text-base text-white border-b-[1px] border-b-black-44 py-[20px]"
										style={{ fontFamily: fontFamily.bold }}
									>
										Лента
									</Text>
								</View>
							</>
						}
						contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
					/>
				</BlurProvider>
			</SafeAreaProvider>
		</>
	)
}

export default UserProfilePage
