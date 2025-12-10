import React, { useEffect, useState } from 'react'
import { FlatList, View, Text, RefreshControl } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { deleteFriendById, getMyFriendsList, IFriend } from '@/api/friends'
import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
import { useRouter } from 'expo-router'
import Modal from '@/components/ui/Modal/Modal'
import { useToast } from '@/hooks/useToast'
import { IUser } from '@/store/authStore'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'

const MyFriendsPage = () => {
	const insets = useSafeAreaInsets()
	const router = useRouter()
	const toast = useToast()
	const [data, setData] = useState<{
		friends: IFriend[]
		deleteUser: IUser | null
		refreshing: boolean
		isDeleteModalOpened: boolean
	}>({
		friends: [],
		deleteUser: null,
		refreshing: false,
		isDeleteModalOpened: false
	})

	const handleGetAndSetData = async () => {
		try {
			const friendsList = await getMyFriendsList()
			setData((s) => ({ ...s, friends: friendsList }))
		} catch (e) {
			const errors = await e.response.json()
			console.log(errors)
			getFieldsErrors(errors)
		} finally {
			setData((s) => ({ ...s, refreshing: false }))
		}
	}

	const onRefresh = React.useCallback(async () => {
		setData((s) => ({ ...s, refreshing: true }))
		await handleGetAndSetData()
	}, [])

	useEffect(() => {
		handleGetAndSetData()
	}, [])

	const EmptyListComponent = () => (
		<View style={{ flex: 1 }} className="items-center justify-center">
			<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
				К сожалению никого не нашлось
			</Text>
		</View>
	)

	const handleOpenDeleteModal = (user: IUser) => {
		setData((s) => ({ ...s, isDeleteModalOpened: true, deleteUser: user }))
	}

	const handleCloseDeleteModal = () => {
		setData((s) => ({ ...s, isDeleteModalOpened: false, deleteUser: null }))
	}

	const handleDeleteFromFriends = async () => {
		try {
			if (!data.deleteUser?.id) {
				return toast.info('Не выбран пользователь для удаления из друзей')
			}
			await deleteFriendById(data.deleteUser?.id)
			const withoutDeletedUser = data.friends.filter((friend) => friend.user.id !== data.deleteUser?.id)
			setData((s) => ({ ...s, friends: withoutDeletedUser }))
			toast.success('Пользователь удалён из списка друзей')
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
			// const errors = await e.response.json()
			// getFieldsErrors(errors)
		} finally {
			setData((s) => ({ ...s, isDeleteModalOpened: false }))
		}
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
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
				<Container className="gap-[20px] mt-[20px] flex-1" style={{ paddingBottom: insets.bottom + 20 }}>
					<HeaderBack>Друзья</HeaderBack>

					<FlatList
						data={data.friends}
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
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						contentContainerStyle={{
							paddingBottom: 0,
							paddingTop: 10,
							flex: data.friends.length === 0 ? 1 : undefined
						}}
						showsVerticalScrollIndicator={false}
						refreshControl={
							<RefreshControl refreshing={data.refreshing} onRefresh={onRefresh} tintColor="#22CB5A" />
						}
						ListEmptyComponent={EmptyListComponent}
					/>

					<Button variant="white" onPress={() => router.push('/friends/friend-requests')}>
						Запросы в друзья
					</Button>
				</Container>
			</View>
		</SafeAreaProvider>
	)
}

export default MyFriendsPage
