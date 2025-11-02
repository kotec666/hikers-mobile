import React, { useEffect, useState } from 'react'
import { RefreshControl, ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { fontFamily } from '@/constants/Fonts'
import SocialStats from '@/components/ui/Profile/SocialStats'
import { Button } from '@/components/ui/Button'
import RedirectAchievementsInfo from '@/components/ui/Profile/RedirectAchievementsInfo'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import PostListItem from '@/components/ui/Post/PostListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useLocalSearchParams } from 'expo-router'
import NavBar from '@/components/ui/NavBar'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { getUserProfileData, INotMyProfile } from '@/api/profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { subscribeToUser, unsubscribeFromUser } from '@/api/subscribers'
import { useToast } from '@/hooks/useToast'
import Modal from '@/components/ui/Modal/Modal'
import { addAsFriend, deleteFriendById } from '@/api/friends'
import { FriendStatus } from '@shared/enums'

/**
 *
 * Чужой профиль
 *
 * */

const UserProfilePage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const { id } = useLocalSearchParams<{ id: string }>()
	const [data, setData] = useState<{
		profileData: INotMyProfile | null
		refreshing: boolean
		isDeleteModalOpened: boolean
	}>({
		profileData: null,
		refreshing: false,
		isDeleteModalOpened: false
	})

	const friendStatusLabel = {
		[FriendStatus.FALSE]: 'Добавить в друзья',
		[FriendStatus.TRUE]: 'Удалить из друзей',
		[FriendStatus.INVITED]: 'Заявка отправлена'
	}

	const handleGetAndSetData = async () => {
		try {
			const profileData = await getUserProfileData(id)
			console.log('profileData', profileData)
			setData((s) => ({ ...s, profileData: profileData }))
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

	const onRefresh = React.useCallback(async () => {
		setData((s) => ({ ...s, refreshing: true }))
		await handleGetAndSetData()
	}, [])

	const posts = [
		{ id: 1, authorName: 'Сергей Авдотьев', date: 'Вчера' },
		{ id: 2, authorName: 'Сергей Авдотьев', date: 'Вчера' },
		{ id: 3, authorName: 'Сергей Авдотьев', date: 'Вчера' }
	]

	const updateProfileData = (updates: Partial<INotMyProfile>) => {
		setData((s) => ({
			...s,
			profileData: s.profileData ? { ...s.profileData, ...updates } : null
		}))
	}

	const handleClickSubscribe = async () => {
		try {
			if (!data.profileData?.user?.id) {
				return toast.info('Не выбран пользователь для подписки')
			}

			await subscribeToUser(data.profileData?.user.id)
			updateProfileData({ isSubscribed: true })
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
		}
	}

	const handleClickUnsubscribe = async () => {
		try {
			if (!data.profileData?.user?.id) {
				return toast.info('Не выбран пользователь для отписки')
			}

			await unsubscribeFromUser(data.profileData?.user.id)
			updateProfileData({ isSubscribed: false })
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
		}
	}

	const handleClickSubUnsub = async () => {
		if (data.profileData?.isSubscribed) {
			return await handleClickUnsubscribe()
		} else {
			return await handleClickSubscribe()
		}
	}

	const handleDeleteFromFriends = async () => {
		try {
			await deleteFriendById(id)
			updateProfileData({ isFriend: FriendStatus.FALSE })
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
			updateProfileData({ isFriend: FriendStatus.INVITED })
			toast.success('Заявка в друзья отправлена')
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
			// const errors = await e.response.json()
			// getFieldsErrors(errors)
		}
	}

	const handleClickDeleteAddFriend = async () => {
		switch (data.profileData?.isFriend) {
			case FriendStatus.TRUE:
				return handleOpenDeleteModal()
			case FriendStatus.FALSE:
				return sendFriendRequest()
			case FriendStatus.INVITED:
				return toast.info('Заявка в друзья уже отправлена')
		}
	}

	return (
		<>
			<NavBar />
			<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
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
							<Button onPress={handleDeleteFromFriends} variant="white" buttonContainerClassName="flex-1">
								Да
							</Button>
							<Button onPress={handleCloseDeleteModal} variant="white" buttonContainerClassName="flex-1">
								Нет
							</Button>
						</View>
					</View>
				</Modal>
				<ScrollView refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={onRefresh} />}>
					<Container className="gap-[20px]">
						<View className="gap-[20px]">
							<View className="gap-[16px]">
								<View className="flex-row justify-between w-full">
									<UserAvatar
										bordered
										className="w-[117px] h-[117px]"
										iconSize={{ width: 60, height: 60 }}
										avatar={`${PATH_TO_IMAGE}${data.profileData?.user?.avatarFilename}`}
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
									{data.profileData?.user?.name && (
										<Text
											className="text-[19px] text-white"
											style={{ fontFamily: fontFamily.bold }}
										>
											{data.profileData?.user?.name}
										</Text>
									)}
									{data.profileData?.user?.username && (
										<Text
											className="text-base text-gray-ab"
											style={{ fontFamily: fontFamily.medium }}
										>
											@{data.profileData?.user?.username}
										</Text>
									)}
								</View>
							</View>
							<View className="flex-row justify-between gap-[20px]">
								<SocialStats
									label="Подписчики"
									content={data.profileData?.subscribers}
									// hrefTo="/subscribers/my-subscribers"
								/>
								<SocialStats
									label="Друзья"
									content={data.profileData?.friends}
									// hrefTo="/friends/my-friends"
								/>
								<SocialStats
									label="Подписки"
									content={data.profileData?.subscriptions}
									// hrefTo="/subscribers/my-subscriptions"
								/>
							</View>
							<View className="flex-row gap-[10px]">
								<Button
									variant={data.profileData?.isSubscribed ? 'black' : 'white'}
									buttonContainerClassName="flex-1"
									onPress={handleClickSubUnsub}
								>
									{data.profileData?.isSubscribed ? 'Отписаться' : 'Подписаться'}
								</Button>
								<Button
									variant={
										data.profileData?.isFriend === FriendStatus.TRUE ||
										data.profileData?.isFriend === FriendStatus.INVITED
											? 'black'
											: 'white'
									}
									buttonContainerClassName="flex-1"
									onPress={handleClickDeleteAddFriend}
								>
									{data.profileData && friendStatusLabel[data.profileData?.isFriend]}
								</Button>
							</View>
							<RedirectAchievementsInfo achievements={data.profileData?.achievements} userId={id} />
							<ActivityInfo label="Активности" activities={data.profileData?.activities || []} />
						</View>
					</Container>
					<Container className="gap-[15px]" style={{ paddingBottom: 100 }}>
						<Text
							className="text-base text-white border-b-[1px] border-b-black-44 py-[20px]"
							style={{ fontFamily: fontFamily.bold }}
						>
							Лента
						</Text>
						{posts.map((post) => (
							<PostListItem key={post.id} {...post} isMyPost />
						))}
					</Container>
				</ScrollView>
			</SafeAreaProvider>
		</>
	)
}

export default UserProfilePage
