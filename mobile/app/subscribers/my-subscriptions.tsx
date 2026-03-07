import React, { useCallback } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import RoundedMinusSvg from '@/components/svg/RoundedMinusSvg'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { getSubscriptionsList, ISubscribe, unsubscribeFromUser } from '@/api/subscribers'
import { useToast } from '@/hooks/useToast'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { LegendList } from '@legendapp/list'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { Colors } from '@/constants/Colors'

/**
 * Мои подписки, на кого подписан я
 * */
const MySubscriptionsPage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const limit = 10

	const {
		data: subscriptions,
		setData: setSubscriptions,
		loading,
		refreshing,
		loadMore,
		refresh
	} = usePaginatedList<ISubscribe, void>({
		fetchFn: async ({ page, limit }) => {
			try {
				return await getSubscriptionsList({ page, limit })
			} catch (e) {
				const errors = await e.response?.json?.()
				getFieldsErrors(errors)
				return []
			}
		},
		limit
	})

	const handleUnsubscribe = useCallback(
		async (unsubUserId: string) => {
			try {
				await unsubscribeFromUser(unsubUserId)
				setSubscriptions((prev) => prev.filter((subscription) => subscription.user.id !== unsubUserId))
			} catch {
				toast.error('Произошла ошибка, повторите попытку позже')
			}
		},
		[setSubscriptions, toast]
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

	const renderFooter = () =>
		loading ? (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		) : null

	const EmptyListComponent = () => (
		<View style={{ flex: 1 }} className="items-center justify-center">
			<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
				Вы ни на кого не подписаны
			</Text>
		</View>
	)

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Подписки</HeaderBack>
					<LegendList
						data={subscriptions}
						renderItem={renderItem}
						keyExtractor={(item) => item.user.id}
						onEndReached={loadMore}
						onEndReachedThreshold={0.5}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						refreshControl={
							<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#22CB5A" />
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
