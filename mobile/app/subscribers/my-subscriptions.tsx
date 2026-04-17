import React, { useCallback } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import RoundedMinusSvg from '@/components/svg/RoundedMinusSvg'
import { getSubscriptionsList, ISubscribe, unsubscribeFromUser } from '@/api/subscribers'
import { useToast } from '@/hooks/useToast'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { LegendList } from '@legendapp/list'
import { Colors } from '@/constants/Colors'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'

/**
 * Мои подписки, на кого подписан я
 * */
const MySubscriptionsPage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const queryClient = useQueryClient()
	const limit = 15

	const {
		data: subscriptions = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useInfiniteQuery<ISubscribe[], Error, ISubscribe[], ['subscriptionsList'], number>({
		queryKey: ['subscriptionsList'],
		queryFn: ({ pageParam }) =>
			getSubscriptionsList({
				page: pageParam,
				limit
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < limit) return undefined
			return pages.length + 1
		},
		select: (data) => data.pages.flat()
	})

	const handleUnsubscribe = useCallback(
		async (unsubUserId: string) => {
			try {
				await unsubscribeFromUser(unsubUserId)
				await refetch()
				await queryClient.invalidateQueries({ queryKey: ['my-profile'] })
			} catch {
				toast.error('Произошла ошибка, повторите попытку позже')
			}
		},
		[queryClient, refetch, toast]
	)

	const renderItem = useCallback(
		({ item }: { item: ISubscribe }) => (
			<PeopleListItem
				id={item.user.id}
				username={item.user.username}
				name={item.user.name}
				avatar={item.user.avatarFilename ? `${PATH_TO_IMAGE}${item.user.avatarFilename}` : null}
				icon={{
					iconSvg: <RoundedMinusSvg />,
					iconCb: () => handleUnsubscribe(item.user.id)
				}}
			/>
		),
		[handleUnsubscribe]
	)

	const renderFooter = () => {
		// if (loading) return null

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
					Вы ни на кого не подписаны
				</Text>
			</View>
		)
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Подписки</HeaderBack>
					<LegendList
						data={subscriptions}
						renderItem={renderItem}
						keyExtractor={(item) => item.user.id}
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) {
								return fetchNextPage()
							}
						}}
						onEndReachedThreshold={0.5}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						refreshControl={
							<RefreshControl
								refreshing={isRefetching}
								onRefresh={refetch}
								tintColor={Colors['green-main']}
							/>
						}
						ListFooterComponent={renderFooter}
						ListEmptyComponent={EmptyListComponent}
						contentContainerStyle={{
							paddingBottom: insets.bottom + 20,
							paddingTop: 10,
							flex: subscriptions.length === 0 ? 1 : undefined
						}}
					/>
				</Container>
			</View>
		</SafeAreaProvider>
	)
}

export default MySubscriptionsPage
