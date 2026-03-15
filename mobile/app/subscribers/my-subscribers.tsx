import React, { useCallback } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import { getSubscribersList, ISubscribe } from '@/api/subscribers'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { LegendList } from '@legendapp/list'
import { Colors } from '@/constants/Colors'
import { useInfiniteQuery } from '@tanstack/react-query'

/**
 * Мои подписчики, кто подписан на меня
 * */
const MySubscribersPage = () => {
	const insets = useSafeAreaInsets()
	const limit = 15

	// const {
	// 	data: subscribers,
	// 	loading,
	// 	refreshing,
	// 	loadMore,
	// 	refresh
	// } = usePaginatedList<ISubscribe, void>({
	// 	fetchFn: async ({ page, limit }) => {
	// 		try {
	// 			return await getSubscribersList({ page, limit })
	// 		} catch (e: unknown) {
	// 			await getFieldsErrors(e)
	// 			return []
	// 		}
	// 	},
	// 	limit
	// })

	const {
		data: subscribers = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useInfiniteQuery<ISubscribe[], Error, ISubscribe[], ['subscribersList'], number>({
		queryKey: ['subscribersList'],

		queryFn: ({ pageParam }) =>
			getSubscribersList({
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

	const EmptyListComponent = () => {
		if (isFetching) return null
		return (
			<View style={{ flex: 1 }} className="items-center justify-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
					На вас ещё никто не подписан
				</Text>
			</View>
		)
	}

	const renderFooter = () => {
		// if (!loading) return null

		if (!isFetchingNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}

	const renderItem = useCallback(({ item }: { item: ISubscribe }) => {
		return (
			<PeopleListItem
				id={item.user.id}
				username={item.user.username}
				name={item.user.name}
				avatar={item.user.avatarFilename ? `${PATH_TO_IMAGE}${item.user.avatarFilename}` : null}
			/>
		)
	}, [])

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Подписчики</HeaderBack>
					<LegendList
						data={subscribers}
						renderItem={renderItem}
						keyExtractor={(item) => item.user.id}
						//onEndReached={loadMore}
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) {
								fetchNextPage()
							}
						}}
						onEndReachedThreshold={0.5}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
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
						ListFooterComponent={renderFooter}
						ListEmptyComponent={EmptyListComponent}
						contentContainerStyle={{
							paddingBottom: insets.bottom + 20,
							paddingTop: 10,
							flex: subscribers.length === 0 ? 1 : undefined
						}}
					/>
				</Container>
			</View>
		</SafeAreaProvider>
	)
}

export default MySubscribersPage
