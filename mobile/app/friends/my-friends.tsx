import React, { useState } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
import Modal from '@/components/ui/Modal/Modal'
import { useToast } from '@/hooks/useToast'
import { IUser } from '@/store/authStore'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { Colors } from '@/constants/Colors'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import BlurProvider from '@/components/providers/BlurProvider'
import { useMyFriendsQuery, useRemoveFriendMutation } from '@/queries/friends'
import { Page } from '@/components/ui/Page'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { FlashList } from '@shopify/flash-list'

const MyFriendsPage = () => {
	const { push } = useSafeNavigation()
	const toast = useToast()

	const [deleteUser, setDeleteUser] = useState<IUser | null>(null)
	const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false)
	const [loadingId, setLoadingId] = useState<string | null>(null)

	const {
		data: friends = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useMyFriendsQuery()

	const { mutateAsync: deleteFriend, isPending: isDeleteFriendPending } = useRemoveFriendMutation()

	const handleOpenDeleteModal = (user: IUser) => {
		setDeleteUser(user)
		setIsDeleteModalOpened(true)
	}

	const handleCloseDeleteModal = () => {
		setDeleteUser(null)
		setIsDeleteModalOpened(false)
	}

	const handleDeleteFromFriends = async () => {
		if (!deleteUser?.id) {
			return toast.info('Не выбран пользователь для удаления из друзей')
		}
		if (loadingId) return
		setLoadingId(deleteUser.id)

		try {
			await deleteFriend(deleteUser.id)
		} catch {
		} finally {
			handleCloseDeleteModal()
			setLoadingId(null)
		}
	}

	// Функция для определения, загружается ли конкретный друг
	const isFriendLoading = (friendId: string) => {
		return isDeleteFriendPending && deleteUser?.id === friendId
	}

	const EmptyListComponent = () => {
		if (isFetching) return null
		return (
			<View style={{ flex: 1 }} className="items-center justify-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
					К сожалению никого не нашлось
				</Text>
			</View>
		)
	}

	const renderFooter = () => {
		if (!isFetchingNextPage) return null

		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}

	return (
		<Page>
			<BlurProvider>
				<View style={{ flex: 1 }}>
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
					<Container className="gap-[20px] flex-1" style={{ paddingBottom: 10 }}>
						<HeaderBack>Друзья</HeaderBack>

						<FlashList
							data={friends}
							renderItem={({ item }) => (
								<PeopleListItem
									id={item.user.id}
									name={item.user.name}
									username={item.user.username}
									avatar={
										item.user.avatarFilename ? `${PATH_TO_IMAGE}${item.user.avatarFilename}` : null
									}
									isIconDisabled={isFriendLoading(item.user.id)}
									icon={{
										iconSvg: <PeopleRemoveSvg />,
										iconCb: () => handleOpenDeleteModal(item.user)
									}}
								/>
							)}
							keyExtractor={(item) => item.user.id}
							onEndReached={() => {
								if (hasNextPage && !isFetchingNextPage) {
									fetchNextPage()
								}
							}}
							onEndReachedThreshold={0.5}
							ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
							ListEmptyComponent={EmptyListComponent}
							ListFooterComponent={renderFooter}
							refreshControl={
								<RefreshControl
									refreshing={isRefetching}
									onRefresh={() => refetchAndHaptics(refetch)}
									tintColor={Colors['green-main']}
								/>
							}
							contentContainerStyle={{
								paddingBottom: 0,
								paddingTop: 10,
								flexGrow: friends.length === 0 ? 1 : undefined
							}}
							showsVerticalScrollIndicator={false}
						/>

						<Button variant="white" onPress={() => push('/friends/friend-requests')}>
							Запросы в друзья
						</Button>
					</Container>
				</View>
			</BlurProvider>
		</Page>
	)
}

export default MyFriendsPage
