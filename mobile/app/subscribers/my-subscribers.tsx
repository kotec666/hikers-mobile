import React, { useCallback } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { getSubscribersList, ISubscribe } from '@/api/subscribers'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { LegendList } from '@legendapp/list'
import { Colors } from '@/constants/Colors'

/**
 * Мои подписчики, кто подписан на меня
 * */
const MySubscribersPage = () => {
	const insets = useSafeAreaInsets()
	const limit = 10

	const {
		data: subscribers,
		loading,
		refreshing,
		loadMore,
		refresh
	} = usePaginatedList<ISubscribe, void>({
		fetchFn: async ({ page, limit }) => {
			try {
				return await getSubscribersList({ page, limit })
			} catch (e) {
				const errors = await e?.response?.json?.()
				getFieldsErrors(errors)
				return []
			}
		},
		limit
	})

	const EmptyListComponent = () => (
		<View style={{ flex: 1 }} className="items-center justify-center">
			<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
				На вас ещё никто не подписан
			</Text>
		</View>
	)

	const renderFooter = () => {
		if (!loading) return null
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
							flex: subscribers.length === 0 ? 1 : undefined
						}}
					/>
				</Container>
			</View>
		</SafeAreaProvider>
	)
}

export default MySubscribersPage
