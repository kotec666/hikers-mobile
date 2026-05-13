import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React, { useCallback } from 'react'
import { fontFamily } from '@/constants/Fonts'
import { NotificationListItem } from '@/components/ui/Notifications/NotificationListItem'
import { Button } from '@/components/ui/Button'
import SwipeableProvider from '@/components/providers/SwipeableProvider'
import { LegendList } from '@legendapp/list'
import { Colors } from '@/constants/Colors'
import { INotification } from '@/api/notifications'
import { useReadNotificationsOnView } from '@/hooks/useReadNotificationsOnView'
import {
	useDeleteNotificationsMutation,
	useMarkNotificationsAsReadMutation,
	useNotificationsListQuery
} from '@/queries/notifications'
import { Page } from '@/components/ui/Page'

const NotificationsPage = () => {
	const {
		data: notificationsData = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useNotificationsListQuery()

	const { mutate: deleteNotifications } = useDeleteNotificationsMutation()
	const { mutate: markAsRead } = useMarkNotificationsAsReadMutation()

	const handleDeleteNotification = async (id?: string) => {
		deleteNotifications(id ? [id] : [])
	}

	const readNotificationsByIds = (ids: string[]) => {
		markAsRead(ids)
	}

	const { onViewableItemsChanged } = useReadNotificationsOnView<INotification>(
		readNotificationsByIds,
		(item) => item.readedAt !== null
	)

	const renderEmpty = useCallback(() => {
		if (isFetching) return null

		return (
			<View style={{ flex: 1 }} className="items-center justify-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
					Уведомления отсутствуют
				</Text>
			</View>
		)
	}, [isFetching])

	return (
		<Page>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px]">
					<HeaderBack>Уведомления</HeaderBack>
					{!notificationsData.length || isFetching ? null : (
						<Button variant="white" onPress={() => handleDeleteNotification()}>
							Очистить все уведомления
						</Button>
					)}
				</Container>
				<View className="gap-[20px] mt-[20px] flex-1">
					<LegendList
						data={notificationsData}
						ListEmptyComponent={renderEmpty}
						onViewableItemsChanged={onViewableItemsChanged}
						viewabilityConfig={{
							itemVisiblePercentThreshold: 50
						}}
						renderItem={({ item }) => (
							<SwipeableProvider
								onSwiped={() => handleDeleteNotification(item.id)}
								cardBackgroundColor={Colors['black-0d']}
							>
								<NotificationListItem notification={item} className="pb-[15px]" />
							</SwipeableProvider>
						)}
						onEndReached={() => {
							if (hasNextPage && !isFetchingNextPage) {
								fetchNextPage()
							}
						}}
						refreshControl={
							<RefreshControl
								refreshing={isRefetching}
								onRefresh={refetch}
								tintColor={Colors['green-main']}
							/>
						}
						onEndReachedThreshold={0.4}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{
							flexGrow: 1,
							paddingBottom: 50
						}}
						ListFooterComponent={
							isFetchingNextPage ? (
								<View style={{ padding: 20 }}>
									<ActivityIndicator size="small" color={Colors['green-main']} />
								</View>
							) : null
						}
						showsVerticalScrollIndicator={false}
					/>
				</View>
			</View>
		</Page>
	)
}

export default NotificationsPage
