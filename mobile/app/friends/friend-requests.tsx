import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, View, Text, RefreshControl } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import RoundedPlusSvg from '@/components/svg/RoundedPlusSvg'
import RoundedMinusSvg from '@/components/svg/RoundedMinusSvg'
import { acceptFriendRequest, getPendingInvitesList, IInvite, rejectFriendRequest } from '@/api/friends'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useToast } from '@/hooks/useToast'

const FriendRequestsPage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const [data, setData] = useState<{
		friendRequests: IInvite[]
		refreshing: boolean
	}>({
		friendRequests: [],
		refreshing: false
	})

	const handleAddFriend = async (newFriendId: string) => {
		try {
			await acceptFriendRequest(newFriendId)
			const withoutAddedUser = data.friendRequests.filter(
				(friendRequest) => friendRequest.invitedUser.id !== newFriendId
			)
			setData((s) => ({ ...s, friendRequests: withoutAddedUser }))
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
		}
	}

	const handleDeleteFriendRequest = async (rejectUserId: string) => {
		try {
			await rejectFriendRequest(rejectUserId)
			const withoutRejectedUser = data.friendRequests.filter(
				(friendRequest) => friendRequest.invitedUser.id !== rejectUserId
			)
			setData((s) => ({ ...s, friendRequests: withoutRejectedUser }))
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
		}
	}

	const handleGetAndSetData = async () => {
		try {
			const friendRequests = await getPendingInvitesList()
			setData((s) => ({ ...s, friendRequests: friendRequests }))
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
				У вас нет заявок в друзья
			</Text>
		</View>
	)

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<SafeAreaView style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Запросы в друзья</HeaderBack>
					<FlatList
						data={data.friendRequests}
						renderItem={({ item }) => (
							<PeopleListItem
								id={item.invitedUser.id}
								username={item.invitedUser.username}
								name={item.invitedUser.name}
								avatar={item.invitedUser.avatarFilename}
								icon={[
									{
										iconSvg: <RoundedPlusSvg />,
										iconCb: () => handleAddFriend(item.invitedUser.id)
									},
									{
										iconSvg: <RoundedMinusSvg />,
										iconCb: () => handleDeleteFriendRequest(item.invitedUser.id)
									}
								]}
							/>
						)}
						keyExtractor={(item) => item.invitedUser.id}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						contentContainerStyle={{
							paddingBottom: insets.bottom + 20,
							paddingTop: 10,
							flex: data.friendRequests.length === 0 ? 1 : undefined
						}}
						showsVerticalScrollIndicator={false}
						refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={onRefresh} />}
						ListEmptyComponent={EmptyListComponent}
					/>
				</Container>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default FriendRequestsPage
