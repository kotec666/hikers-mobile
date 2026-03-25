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
import { useToast } from '@/hooks/useToast'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { LegendList } from '@legendapp/list'
import { Colors } from '@/constants/Colors'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

interface IInfiniteInvites {
	pages: IInvite[][]
	pageParams: number[]
}

const FriendRequestsPage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const loadingIdsRef = React.useRef<Set<string>>(new Set())
	const queryClient = useQueryClient()

	const limit = 15

	const {
		data: friendRequestsRaw,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useInfiniteQuery({
		queryKey: ['pendingInvites'],

		queryFn: ({ pageParam }) =>
			getPendingInvitesList({
				page: pageParam,
				limit
			}),

		initialPageParam: 1,

		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < limit) return undefined
			return pages.length + 1
		}
	})

	const friendRequests = friendRequestsRaw?.pages.flat() ?? []

	const handleAddFriend = async (newFriendId: string) => {
		if (loadingIdsRef.current.has(newFriendId)) return
		loadingIdsRef.current.add(newFriendId)

		try {
			await acceptFriendRequest(newFriendId)
			// setItems((prev) => prev.filter((req) => req.user.id !== newFriendId))
			// await refetch()
			queryClient.setQueryData<IInfiniteInvites>(['pendingInvites'], (oldData) => {
				if (!oldData) return oldData

				return {
					...oldData,
					pages: oldData.pages.map((page: IInvite[]) => page.filter((req) => req.user.id !== newFriendId))
				}
			})
			toast.success('Пользователь добавлен в друзья')
		} catch {
			toast.error('Произошла ошибка, повторите попытку позже')
		} finally {
			loadingIdsRef.current.delete(newFriendId)
		}
	}

	const handleDeleteFriendRequest = async (rejectUserId: string) => {
		if (loadingIdsRef.current.has(rejectUserId)) return
		loadingIdsRef.current.add(rejectUserId)

		try {
			await rejectFriendRequest(rejectUserId)
			// setItems((prev) => prev.filter((req) => req.user.id !== rejectUserId))
			// await refetch()
			queryClient.setQueryData<IInfiniteInvites>(['pendingInvites'], (oldData) => {
				if (!oldData) return oldData

				return {
					...oldData,
					pages: oldData.pages.map((page: IInvite[]) => page.filter((req) => req.user.id !== rejectUserId))
				}
			})
			toast.success('Заявка отклонена')
		} catch {
			toast.error('Произошла ошибка, повторите попытку позже')
		} finally {
			loadingIdsRef.current.delete(rejectUserId)
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
								onRefresh={refetch}
								tintColor={Colors['green-main']}
							/>
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
