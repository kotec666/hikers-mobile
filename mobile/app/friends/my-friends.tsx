import React, { useState } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { deleteFriendById, getMyFriendsList, IFriend } from '@/api/friends'
import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
import Modal from '@/components/ui/Modal/Modal'
import { useToast } from '@/hooks/useToast'
import { IUser } from '@/store/authStore'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { LegendList } from '@legendapp/list'
import { Colors } from '@/constants/Colors'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useInfiniteQuery } from '@tanstack/react-query'

const MyFriendsPage = () => {
	const insets = useSafeAreaInsets()
	const { push } = useSafeNavigation()
	const toast = useToast()

	const [deleteUser, setDeleteUser] = useState<IUser | null>(null)
	const [isDeleteModalOpened, setIsDeleteModalOpened] = useState(false)

	const limit = 15

	// const {
	// 	data: friends,
	// 	setData: setItems,
	// 	loading,
	// 	refreshing,
	// 	loadMore,
	// 	refresh
	// } = usePaginatedList<IFriend, void>({
	// 	fetchFn: async (params) => {
	// 		try {
	// 			return await getMyFriendsList(params)
	// 		} catch (e: unknown) {
	// 			await getFieldsErrors(e)
	// 			return []
	// 		}
	// 	},
	// 	limit
	// })

	const {
		data: friends = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useInfiniteQuery<IFriend[], Error, IFriend[], ['friendsList'], number>({
		queryKey: ['friendsList'],

		queryFn: ({ pageParam }) =>
			getMyFriendsList({
				page: pageParam,
				limit
			}),

		initialPageParam: 1,

		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < limit) return undefined
			return pages.length + 1
		},

		select: (data) => data.pages.flat()
		// select: (data) => ({
		//         ...data,
		//         pages: data.pages.flat()
		//       }),
	})

	const renderFooter = () => {
		// if (!loading || refreshing) return null
		if (!isFetchingNextPage) return null

		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
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

	const handleOpenDeleteModal = (user: IUser) => {
		setDeleteUser(user)
		setIsDeleteModalOpened(true)
	}

	const handleCloseDeleteModal = () => {
		setDeleteUser(null)
		setIsDeleteModalOpened(false)
	}

	const handleDeleteFromFriends = async () => {
		try {
			if (!deleteUser?.id) {
				return toast.info('Не выбран пользователь для удаления из друзей')
			}

			await deleteFriendById(deleteUser.id)

			// setItems((prev) => prev.filter((friend) => friend.user.id !== deleteUser.id))
			await refetch()
			toast.success('Пользователь удалён из списка друзей')
		} catch {
			toast.error('Произошла ошибка, повторите попытку позже')
		} finally {
			handleCloseDeleteModal()
		}
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
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
							<Button onPress={handleDeleteFromFriends} variant="white" buttonContainerClassName="flex-1">
								Да
							</Button>
							<Button onPress={handleCloseDeleteModal} variant="white" buttonContainerClassName="flex-1">
								Нет
							</Button>
						</View>
					</View>
				</Modal>
				<Container className="gap-[20px] mt-[20px] flex-1" style={{ paddingBottom: insets.bottom + 20 }}>
					<HeaderBack>Друзья</HeaderBack>

					<LegendList
						data={friends}
						renderItem={({ item }) => (
							<PeopleListItem
								id={item.user.id}
								name={item.user.name}
								username={item.user.username}
								avatar={item.user.avatarFilename ? `${PATH_TO_IMAGE}${item.user.avatarFilename}` : null}
								icon={{
									iconSvg: <PeopleRemoveSvg />,
									iconCb: () => handleOpenDeleteModal(item.user)
								}}
							/>
						)}
						keyExtractor={(item) => item.user.id}
						//onEndReached={loadMore}
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) {
								fetchNextPage()
							}
						}}
						onEndReachedThreshold={0.5}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						ListEmptyComponent={EmptyListComponent}
						ListFooterComponent={renderFooter}
						// refreshControl={
						// 	<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#22CB5A" />
						// }
						refreshControl={
							<RefreshControl
								refreshing={isRefetching}
								onRefresh={refetch}
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
		</SafeAreaProvider>
	)
}

export default MyFriendsPage
