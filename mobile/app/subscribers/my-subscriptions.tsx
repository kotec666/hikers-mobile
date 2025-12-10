import React, { useEffect, useState } from 'react'
import { FlatList, View, Text, RefreshControl } from 'react-native'
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

/**
 * Мои подписки, на кого подписан я
 * */
const MySubscriptionsPage = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const [data, setData] = useState<{
		subscriptions: ISubscribe[]
		refreshing: boolean
	}>({
		subscriptions: [],
		refreshing: false
	})

	const handleUnsubscribe = async (unsubUserId: string) => {
		try {
			await unsubscribeFromUser(unsubUserId)
			const withoutUnsubscribedUser = data.subscriptions.filter(
				(subscription) => subscription.user.id !== unsubUserId
			)
			setData((s) => ({ ...s, subscriptions: withoutUnsubscribedUser }))
		} catch (e) {
			toast.error('Произошла ошибка, повторите попытку позже')
		}
	}

	const handleGetAndSetData = async () => {
		try {
			const subscriptionsList = await getSubscriptionsList()
			setData((s) => ({ ...s, subscriptions: subscriptionsList }))
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
				Вы ни на кого не подписаны
			</Text>
		</View>
	)

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Подписки</HeaderBack>
					<FlatList
						data={data.subscriptions}
						renderItem={({ item }) => (
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
						)}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						contentContainerStyle={{
							paddingBottom: insets.bottom + 20,
							paddingTop: 10,
							flex: data.subscriptions.length === 0 ? 1 : undefined
						}}
						showsVerticalScrollIndicator={false}
						keyExtractor={(item) => item.user.id}
						refreshControl={
							<RefreshControl refreshing={data.refreshing} onRefresh={onRefresh} tintColor="#22CB5A" />
						}
						ListEmptyComponent={EmptyListComponent}
					/>
				</Container>
			</View>
		</SafeAreaProvider>
	)
}

export default MySubscriptionsPage
