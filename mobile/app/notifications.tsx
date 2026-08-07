import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React, { useCallback } from 'react'
import { fontFamily } from '@/constants/Fonts'
import { NotificationListItem } from '@/components/ui/Notifications/NotificationListItem'
import { Button } from '@/components/ui/Button'
import SwipeableProvider from '@/components/providers/SwipeableProvider'
import { Colors } from '@/constants/Colors'
import { INotification } from '@/api/notifications'
import { useReadNotificationsOnView } from '@/hooks/useReadNotificationsOnView'
import {
	useDeleteNotificationsMutation,
	useMarkNotificationsAsReadMutation,
	useNotificationsListQuery
} from '@/queries/notifications'
import { Page } from '@/components/ui/Page'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { FlashList } from '@shopify/flash-list'
import LoadQueryErrorRetry from '@/components/LoadQueryErrorRetry'
import { NotificationsListSkeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

const NotificationsPage = () => {
	const { t } = useTranslation()
	const {
		data: notificationsData = [],
		fetchNextPage,
		hasNextPage,
		isLoading,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isError
	} = useNotificationsListQuery()

	const { mutate: deleteNotifications } = useDeleteNotificationsMutation()
	const { mutate: markAsRead } = useMarkNotificationsAsReadMutation()

	const handleRetry = useCallback(() => {
		return refetch()
	}, [refetch])

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
		if (isLoading) {
			return (
				<Container>
					<NotificationsListSkeleton />
				</Container>
			)
		}

		if (isError) {
			return (
				<LoadQueryErrorRetry
					text={t('LoadQueryErrorRetry.label.failedToLoadNotifications')}
					buttonText={t('LoadQueryErrorRetry.action.tryAgain')}
					onRetry={handleRetry}
				/>
			)
		}

		return (
			<View style={{ flex: 1 }} className="items-center justify-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
					{t('EmptyListText.noNotifications')}
				</Text>
			</View>
		)
	}, [isLoading, isError, t, handleRetry])

	const renderFooter = useCallback(() => {
		if (isError && notificationsData.length > 0) {
			return (
				<LoadQueryErrorRetry
					text={t('LoadQueryErrorRetry.label.cantLoadMore')}
					buttonText={t('LoadQueryErrorRetry.action.retry')}
					onRetry={handleRetry}
				/>
			)
		}
		if (!isFetchingNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [isError, notificationsData.length, isFetchingNextPage, t, handleRetry])

	return (
		<Page>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px]">
					<HeaderBack>{t('NotificationsPage.header')}</HeaderBack>
					{!notificationsData.length || isLoading ? null : (
						<Button variant="white" onPress={() => handleDeleteNotification()}>
							{t('NotificationsPage.clearAll')}
						</Button>
					)}
				</Container>
				<View className="gap-[20px] mt-[20px] flex-1">
					<FlashList
						data={notificationsData}
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
								onRefresh={() => refetchAndHaptics(handleRetry)}
								tintColor={Colors['green-main']}
							/>
						}
						onEndReachedThreshold={0.4}
						keyExtractor={(item) => item.id}
						contentContainerStyle={{
							paddingBottom: 50
						}}
						ListFooterComponent={renderFooter}
						ListEmptyComponent={renderEmpty}
						showsVerticalScrollIndicator={false}
					/>
				</View>
			</View>
		</Page>
	)
}

export default NotificationsPage
