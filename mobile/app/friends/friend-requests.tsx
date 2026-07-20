import React, { useState } from 'react'
import { ActivityIndicator, View, Text, RefreshControl } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { fontFamily } from '@/constants/Fonts'
import RoundedPlusSvg from '@/components/svg/RoundedPlusSvg'
import RoundedMinusSvg from '@/components/svg/RoundedMinusSvg'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { Colors } from '@/constants/Colors'
import { useAcceptFriendRequestMutation, useMyFriendRequestsQuery, useRejectFriendMutation } from '@/queries/friends'
import { Page } from '@/components/ui/Page'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { FlashList } from '@shopify/flash-list'

const FriendRequestsPage = () => {
	const {
		data: friendRequests = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useMyFriendRequestsQuery()

	const { mutateAsync: acceptFriend, isPending: isAcceptPending } = useAcceptFriendRequestMutation()
	const { mutateAsync: rejectFriend, isPending: isRejectPending } = useRejectFriendMutation()

	const [loadingId, setLoadingId] = useState<string | null>(null)

	const isRequestLoading = (requestId: string) => {
		return (isAcceptPending || isRejectPending) && loadingId === requestId
	}

	const handleAddFriend = async (newFriendId: string) => {
		if (loadingId) return
		setLoadingId(newFriendId)
		try {
			await acceptFriend(newFriendId)
		} catch {
		} finally {
			setLoadingId(null)
		}
	}

	const handleDeleteFriendRequest = async (rejectUserId: string) => {
		if (loadingId) return
		setLoadingId(rejectUserId)

		try {
			await rejectFriend(rejectUserId)
		} catch {
		} finally {
			setLoadingId(null)
		}
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
			<Container className="gap-[20px] flex-1">
				<HeaderBack>Запросы в друзья</HeaderBack>
				<FlashList
					data={friendRequests}
					renderItem={({ item }) => (
						<PeopleListItem
							id={item.user.id}
							username={item.user.username}
							name={item.user.name}
							avatar={item.user.avatarFilename ? `${PATH_TO_IMAGE}${item.user.avatarFilename}` : null}
							isIconDisabled={isRequestLoading(item.user.id)}
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
					onEndReached={() => {
						if (hasNextPage && !isFetchingNextPage) {
							fetchNextPage()
						}
					}}
					onEndReachedThreshold={0.5}
					ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={() => {
						if (isFetching) return null
						return (
							<View style={{ flex: 1 }} className="items-center justify-center">
								<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
									У вас нет заявок в друзья
								</Text>
							</View>
						)
					}}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={() => refetchAndHaptics(refetch)}
							tintColor={Colors['green-main']}
						/>
					}
					contentContainerStyle={{
						paddingBottom: 20,
						paddingTop: 10,
						flexGrow: friendRequests.length === 0 ? 1 : undefined
					}}
					showsVerticalScrollIndicator={false}
				/>
			</Container>
		</Page>
	)
}

export default FriendRequestsPage
