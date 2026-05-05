import React, { useCallback } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import RoundedMinusSvg from '@/components/svg/RoundedMinusSvg'
import { ISubscribe } from '@/api/subscribers'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { LegendList } from '@legendapp/list'
import { Colors } from '@/constants/Colors'
import { useMySubscriptionsQuery, useToggleSubscribeMutation } from '@/queries/subscriptions'

/**
 * Мои подписки, на кого подписан я
 * */
const MySubscriptionsPage = () => {
	const insets = useSafeAreaInsets()

	const {
		data: subscriptions = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useMySubscriptionsQuery()

	const { mutateAsync: toggleSubscribe, isPending: isPendingSubscribe } = useToggleSubscribeMutation()

	const handleSubscribe = useCallback(
		async (userId: string, isSubscribed: boolean) => {
			await toggleSubscribe({
				userId,
				isSubscribed
			})
		},
		[toggleSubscribe]
	)

	const renderItem = useCallback(
		({ item }: { item: ISubscribe }) => (
			<PeopleListItem
				id={item.user.id}
				username={item.user.username}
				name={item.user.name}
				avatar={item.user.avatarFilename ? `${PATH_TO_IMAGE}${item.user.avatarFilename}` : null}
				isIconDisabled={isPendingSubscribe}
				icon={{
					iconSvg: <RoundedMinusSvg />,
					iconCb: () => handleSubscribe(item.user.id, true)
				}}
			/>
		),
		[handleSubscribe, isPendingSubscribe]
	)

	const renderFooter = () => {
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
