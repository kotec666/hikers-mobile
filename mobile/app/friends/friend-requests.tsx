import React from 'react'
import { ActivityIndicator, View, Text, RefreshControl } from 'react-native'
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
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { LegendList } from '@legendapp/list'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { Colors } from '@/constants/Colors'

const FriendRequestsPage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const limit = 10

	const {
		data: friendRequests,
		setData: setItems,
		loading,
		refreshing,
		loadMore,
		refresh
	} = usePaginatedList<IInvite, void>({
		fetchFn: async (params) => {
			try {
				return await getPendingInvitesList(params)
			} catch (e) {
				const errors = await e.response?.json?.()
				getFieldsErrors(errors)
				return []
			}
		},
		limit
	})

	const handleAddFriend = async (newFriendId: string) => {
		try {
			await acceptFriendRequest(newFriendId)
			setItems((prev) => prev.filter((req) => req.user.id !== newFriendId))
			toast.success('Пользователь добавлен в друзья')
		} catch {
			toast.error('Произошла ошибка, повторите попытку позже')
		}
	}

	const handleDeleteFriendRequest = async (rejectUserId: string) => {
		try {
			await rejectFriendRequest(rejectUserId)
			setItems((prev) => prev.filter((req) => req.user.id !== rejectUserId))
			toast.success('Заявка отклонена')
		} catch {
			toast.error('Произошла ошибка, повторите попытку позже')
		}
	}

	const renderFooter = () => {
		if (!loading || refreshing) return null

		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Запросы в друзья</HeaderBack>
					<LegendList
						data={friendRequests}
						renderItem={({ item }) => (
							<PeopleListItem
								id={item.user.id}
								username={item.user.username}
								name={item.user.name}
								avatar={item.user.avatarFilename ? `${PATH_TO_IMAGE}${item.user.avatarFilename}` : null}
								icon={[
									{
										iconSvg: <RoundedPlusSvg />,
										iconCb: () => handleAddFriend(item.user.id)
									},
									{
										iconSvg: <RoundedMinusSvg />,
										iconCb: () => handleDeleteFriendRequest(item.user.id)
									}
								]}
							/>
						)}
						keyExtractor={(item) => item.user.id}
						onEndReached={loadMore}
						onEndReachedThreshold={0.5}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						ListFooterComponent={renderFooter}
						ListEmptyComponent={() => (
							<View style={{ flex: 1 }} className="items-center justify-center">
								<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
									У вас нет заявок в друзья
								</Text>
							</View>
						)}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#22CB5A" />
						}
						contentContainerStyle={{
							paddingBottom: insets.bottom + 20,
							paddingTop: 10,
							flexGrow: friendRequests.length === 0 ? 1 : undefined
						}}
						showsVerticalScrollIndicator={false}
					/>
				</Container>
			</View>
		</SafeAreaProvider>
	)
}

export default FriendRequestsPage
