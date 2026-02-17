import React, { useEffect, useState, useCallback, useRef } from 'react'
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import SocialStats from '@/components/ui/Profile/SocialStats'
import { Button } from '@/components/ui/Button'
import RedirectAchievementsInfo from '@/components/ui/Profile/RedirectAchievementsInfo'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import PostListItem from '@/components/ui/Post/PostListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { getUserProfileData, INotMyProfile } from '@/api/profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { subscribeToUser, unsubscribeFromUser } from '@/api/subscribers'
import { useToast } from '@/hooks/useToast'
import Modal from '@/components/ui/Modal/Modal'
import { addAsFriend, deleteFriendById, revokeFriendInviteByUserId } from '@/api/friends'
import { FriendStatus } from '@shared/enums'
import { AnimatedProfilePicture } from '@/components/ui/Profile/AnimatedProfilePicture'
import { LegendList, LegendListRef } from '@legendapp/list'
import { getPostsByUserId, IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import MapComponent from '@/components/map/MapComponent'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import { useOptimisticToggle } from '@/hooks/useOptimisticToggle'

/**
 *
 * Чужой профиль
 *
 * */

const UserProfilePage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const { id } = useLocalSearchParams<{ id: string }>()
	const [profileData, setProfileData] = useState<INotMyProfile | null>(null)
	const [data, setData] = useState<{
		refreshing: boolean
		isDeleteModalOpened: boolean
	}>({
		refreshing: false,
		isDeleteModalOpened: false
	})

	const {
		value: isSubscribed,
		toggle: toggleSubscribe,
		isLoading: isSubscribeLoading
	} = useOptimisticToggle({
		initialValue: profileData?.isSubscribed ?? false,
		onEnable: async () => {
			if (!profileData?.user?.id) throw new Error('Пользователь не выбран')
			await subscribeToUser(profileData.user.id)
		},
		onDisable: async () => {
			if (!profileData?.user?.id) throw new Error('Пользователь не выбран')
			await unsubscribeFromUser(profileData.user.id)
		},
		onError: () => toast.error('Ошибка при подписке/отписке'),
		onSuccess: (val) => {
			// синхронизируем profileData и ленту
			updateProfileData((prev) => ({
				isSubscribed: val,
				subscribers: (prev.subscribers ?? 0) + (val ? 1 : -1)
			}))
			setPosts((prev) =>
				prev.map((post) =>
					post.userCreator.id === profileData?.user?.id ? { ...post, isSubscribed: val } : post
				)
			)
		}
	})

	const [posts, setPosts] = useState<IPost[]>([])
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const [hasMore, setHasMore] = useState(true)

	const limit = 5
	const legendListRef = useRef<LegendListRef>(null)

	const friendStatusLabel = {
		[FriendStatus.FALSE]: 'Добавить в друзья',
		[FriendStatus.TRUE]: 'Удалить из друзей',
		[FriendStatus.INVITED]: 'Заявка отправлена'
	}

	const handleGetAndSetData = async () => {
		try {
			const profileData = await getUserProfileData(id)
			setProfileData(profileData)
		} catch (e) {
			const errors = await e.response.json()
			console.log(errors)
			getFieldsErrors(errors)
		} finally {
			setData((s) => ({ ...s, refreshing: false }))
		}
	}

	useEffect(() => {
		handleGetAndSetData()
	}, [])

	const updateProfileData = (updater: (prev: INotMyProfile) => Partial<INotMyProfile>) => {
		setProfileData((prev) => {
			if (!prev) return prev

			return {
				...prev,
				...updater(prev)
			}
		})
	}

	const subUnsubCallback = (isSubscribed: boolean, authorId?: string) => {
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

		setPosts((prev) =>
			prev.map((post) => (post.userCreator.id === authorId ? { ...post, isSubscribed: isSubscribed } : post))
		)
	}

	const handleDeleteFromFriends = async () => {
		try {
			await deleteFriendById(id)
			const friendsCount =
				typeof profileData?.friends === 'number' ? profileData.friends - 1 : profileData?.friends

			updateProfileData(() => ({
				isFriend: FriendStatus.FALSE,
				friends: friendsCount
			}))
			toast.success('Пользователь удалён из списка друзей')
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
			// const errors = await e.response.json()
			// getFieldsErrors(errors)
		} finally {
			setData((s) => ({ ...s, isDeleteModalOpened: false }))
		}
	}

	const handleCloseDeleteModal = () => {
		setData((s) => ({ ...s, isDeleteModalOpened: false }))
	}

	const handleOpenDeleteModal = () => {
		setData((s) => ({ ...s, isDeleteModalOpened: true }))
	}

	const sendFriendRequest = async () => {
		try {
			await addAsFriend(id)
			updateProfileData(() => ({
				isFriend: FriendStatus.INVITED
			}))
			toast.success('Заявка в друзья отправлена')
		} catch {
			toast.error('Произошла ошибка, повторите попытку позже')
			// const errors = await e.response.json()
			// getFieldsErrors(errors)
		}
	}

	const revokeFriendRequest = async () => {
		try {
			await revokeFriendInviteByUserId(id)
			updateProfileData(() => ({
				isFriend: FriendStatus.FALSE
			}))
			toast.success('Заявка в друзья отозвана')
		} catch {
			toast.error('Произошла ошибка, повторите попытку позже')
			// const errors = await e.response.json()
			// getFieldsErrors(errors)
		}
	}

	const handleClickDeleteAddFriend = async () => {
		switch (profileData?.isFriend) {
			case FriendStatus.TRUE:
				return handleOpenDeleteModal()
			case FriendStatus.FALSE:
				return sendFriendRequest()
			case FriendStatus.INVITED:
				return revokeFriendRequest()
		}
	}

	const loadPosts = useCallback(
		async (pageNum: number, isRefresh = false) => {
			if (loading && !isRefresh) return

			setLoading(true)
			try {
				const newPosts = await getPostsByUserId(id, { page: pageNum, limit })

				if (isRefresh) {
					setPosts(newPosts)
				} else {
					setPosts((prev) => [...prev, ...newPosts])
				}

				if (newPosts.length < limit) {
					setHasMore(false)
				} else {
					setHasMore(true)
				}
			} catch (error) {
				console.error('Error loading posts:', error)
			} finally {
				setLoading(false)
			}
		},
		[id, loading]
	)

	useEffect(() => {
		const init = async () => {
			await handleGetAndSetData()
			await loadPosts(1, true)
		}

		init()
	}, [id])

	const onRefresh = useCallback(async () => {
		setData((s) => ({ ...s, refreshing: true }))
		setPage(1)
		setHasMore(true)

		await Promise.all([handleGetAndSetData(), loadPosts(1, true)])

		setData((s) => ({ ...s, refreshing: false }))
	}, [loadPosts])

	const loadMorePosts = useCallback(() => {
		if (hasMore && !loading) {
			const nextPage = page + 1
			setPage(nextPage)
			loadPosts(nextPage)
		}
	}, [hasMore, loading, page, loadPosts])

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
	}, [])

	return (
		<>
			<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
				<LegendList
					ref={legendListRef}
					data={posts}
					renderItem={renderPostItem}
					keyExtractor={(item) => item.id}
					onEndReached={loadMorePosts}
					onEndReachedThreshold={0.5}
					ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
					ListFooterComponent={
						loading ? (
							<View style={{ padding: 20 }}>
								<ActivityIndicator size="small" color={Colors['green-main']} />
							</View>
						) : null
					}
					refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={onRefresh} />}
					ListHeaderComponent={
						<>
							<Modal
								isOpen={data.isDeleteModalOpened}
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
											>
												{profileData && friendStatusLabel[profileData?.isFriend]}
											</Button>
										</View>
										<RedirectAchievementsInfo
											achievements={profileData?.achievements}
											userId={id}
										/>
										<ActivityInfo label="Активности" activities={profileData?.activities || []} />
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
			</SafeAreaProvider>
		</>
	)
}

export default UserProfilePage
