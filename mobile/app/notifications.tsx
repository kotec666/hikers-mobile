import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import {
	deleteNotificationsById,
	getNotificationsList,
	INotification,
	markNotificationsAsReadById
} from '@/api/notifications'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useReadNotificationsOnView } from '@/hooks/useReadNotificationsOnView'

interface IInfiniteNotifications {
	pages: INotification[][]
	pageParams: number[]
}

const NotificationsPage = () => {
	const insets = useSafeAreaInsets()
	const queryClient = useQueryClient()

	const limit = 15

	const {
		data: notificationsDataRaw,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useInfiniteQuery({
		queryKey: ['notifications-page'],
		queryFn: ({ pageParam = 1 }) => {
			return getNotificationsList({
				page: pageParam,
				limit: limit
			})
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => (lastPage.length === limit ? pages.length + 1 : undefined)
	})

	const notificationsData = notificationsDataRaw?.pages.flat() ?? []

	const handleDeleteNotification = async (id?: string) => {
		// id есть - удаление одного
		// нет - удаление всех
		try {
			await deleteNotificationsById({ ids: id ? [id] : [] })
			queryClient.setQueryData<IInfiniteNotifications>(['notifications-page'], (oldData) => {
				if (!oldData) return oldData

				// Если id не передан — очистить все уведомления
				if (!id) {
					return { ...oldData, pages: oldData.pages.map(() => []) }
				}

				// Удаляем только указанное уведомление
				return {
					...oldData,
					pages: oldData.pages.map((page) => page.filter((notif) => notif.id !== id))
				}
			})
		} catch (e) {
			await getFieldsErrors(e)
		}
	}

	const readNotificationsByIds = async (ids: string[]) => {
		try {
			await markNotificationsAsReadById({
				ids
			})
		} catch (e) {
			await getFieldsErrors(e)
		}
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
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
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
							<SwipeableProvider onSwiped={() => handleDeleteNotification(item.id)}>
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
							paddingBottom: insets.bottom + 20,
							paddingTop: 10
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
		</SafeAreaProvider>
	)
}

export default NotificationsPage
