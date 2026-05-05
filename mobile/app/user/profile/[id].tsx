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
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useToast } from '@/hooks/useToast'
import Modal from '@/components/ui/Modal/Modal'
import { FriendStatus } from '@shared/enums'
import { AnimatedProfilePicture } from '@/components/ui/Profile/AnimatedProfilePicture'
import { LegendList, LegendListRef } from '@legendapp/list'
import { IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import MapComponent from '@/components/map/MapComponent'
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
	const { id } = useLocalSearchParams<{ id: string }>()
	const legendListRef = useRef<LegendListRef>(null)

	const [isDeleteModalOpened, setIsDeleteModalOpened] = useState<boolean>(false)

	const {
		data: profileData,
		error,
		isError,
		isFetching: isProfileFetching,
		refetch: refetchProfile
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
		isRefetching: postsIsRefetching
	} = useNotMyProfilePostsQuery(id)

	const { mutateAsync: toggleSubscribe, isPending: isPendingSubscribe } = useToggleSubscribeMutation()

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

	const handleDeleteFromFriends = async () => {
		try {
			await removeFriend(id)
			toast.success('Пользователь удалён из друзей')
		} catch (e: unknown) {
			toast.error('Произошла ошибка, повторите попытку позже')
			await getFieldsErrors(e)
		} finally {
			setIsDeleteModalOpened(false)
		}
	}

	const handleCloseDeleteModal = () => {
		setIsDeleteModalOpened(false)
	}

	const handleSendFriendRequest = async () => {
		try {
			await sendRequest(id)

			toast.success('Заявка в друзья отправлена')
		} catch (e: unknown) {
			toast.error('Произошла ошибка, повторите попытку позже')
			await getFieldsErrors(e)
		}
	}

	const handleRevokeFriendRequest = async () => {
		try {
			await revokeRequest(id)
			toast.success('Заявка в друзья отозвана')
		} catch (e: unknown) {
			toast.error('Произошла ошибка, повторите попытку позже')
			await getFieldsErrors(e)
		}
	}

	const handleAcceptFriendRequest = async () => {
		try {
			await acceptFriend(id)
			toast.success('Заявка в друзья принята')
		} catch (e: unknown) {
			toast.error('Произошла ошибка, повторите попытку позже')
			await getFieldsErrors(e)
		}
	}

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

	// Определяем вариант кнопки
	const getButtonVariant = () => {
		const isFriend = profileData?.isFriend
		if (isFriend === FriendStatus.TRUE || isFriend === FriendStatus.INVITED) {
			return 'black'
		}
		return 'white'
	}

	const renderFooter = useCallback(() => {
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
												isLoading={isRemoveFriendPending}
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
									<HeaderBack>Профиль</HeaderBack>
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
													{profileData?.isSubscribed ? 'Отписаться' : 'Подписаться'}
												</Button>
												<Button
													variant={getButtonVariant()}
													buttonContainerClassName="flex-1"
													onPress={handleFriendAction}
													isLoading={isFriendActionPending}
												>
													{profileData && friendStatusLabel[profileData?.isFriend]}
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
