import React, { useCallback } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { fontFamily } from '@/constants/Fonts'
import { ISubscribe } from '@/api/subscribers'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { LegendList } from '@legendapp/list/react-native'
import { Colors } from '@/constants/Colors'
import { useMySubscribersQuery } from '@/queries/subscribers'
import { Page } from '@/components/ui/Page'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'

/**
 * Мои подписчики, кто подписан на меня
 * */
const MySubscribersPage = () => {
	const {
		data: subscribers = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useMySubscribersQuery()

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
		<Page>
			<Container className="gap-[20px] flex-1">
				<HeaderBack>Подписчики</HeaderBack>
				<LegendList
					data={subscribers}
					renderItem={renderItem}
					keyExtractor={(item) => item.user.id}
					onEndReached={() => {
						if (hasNextPage && !isFetchingNextPage) {
							fetchNextPage()
						}
					}}
					onEndReachedThreshold={0.5}
					ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={() => refetchAndHaptics(refetch)}
							tintColor={Colors['green-main']}
						/>
					}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={EmptyListComponent}
					contentContainerStyle={{
						paddingBottom: 50,
						paddingTop: 10,
						flex: subscribers.length === 0 ? 1 : undefined
					}}
				/>
			</Container>
		</Page>
	)
}

export default MySubscribersPage
