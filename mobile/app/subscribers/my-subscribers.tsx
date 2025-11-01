import React, { useEffect, useState } from 'react'
import { FlatList, SafeAreaView, View, Text, RefreshControl } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { getSubscribersList, getSubscriptionsList, ISubscribe } from '@/api/subscribers'

/**
 * Мои подписчики, кто подписан на меня
 * */
const MySubscribersPage = () => {
	const insets = useSafeAreaInsets()
	const [data, setData] = useState<{
		subscribers: ISubscribe[]
		refreshing: boolean
	}>({
		subscribers: [],
		refreshing: false
	})

	const handleGetAndSetData = async () => {
		try {
			const subscribersList = await getSubscribersList()
			setData((s) => ({ ...s, subscribers: subscribersList }))
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
				На вас ещё никто не подписан
			</Text>
		</View>
	)

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<SafeAreaView style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Подписчики</HeaderBack>
					<FlatList
						data={data.subscribers}
						renderItem={({ item }) => (
							<PeopleListItem
								id={item.user.id}
								username={item.user.username}
								name={item.user.name}
								avatar={item.user.avatarFilename}
							/>
						)}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						contentContainerStyle={{
							paddingBottom: insets.bottom + 20,
							paddingTop: 10,
							flex: data.subscribers.length === 0 ? 1 : undefined
						}}
						showsVerticalScrollIndicator={false}
						keyExtractor={(item) => item.user.id}
						refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={onRefresh} />}
						ListEmptyComponent={EmptyListComponent}
					/>
				</Container>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default MySubscribersPage
