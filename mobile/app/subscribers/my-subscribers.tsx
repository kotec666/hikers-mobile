import React, { useCallback } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { fontFamily } from '@/constants/Fonts'
import { ISubscribe } from '@/api/subscribers'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { Colors } from '@/constants/Colors'
import { useMySubscribersQuery } from '@/queries/subscribers'
import { Page } from '@/components/ui/Page'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { FlashList } from '@shopify/flash-list'
import LoadQueryErrorRetry from '@/components/LoadQueryErrorRetry'
import { UserListSkeleton } from '@/components/ui/skeleton'
import { useTranslation } from 'react-i18next'

/**
 * Мои подписчики, кто подписан на меня
 * */
const MySubscribersPage = () => {
	const { t } = useTranslation()
	const {
		data: subscribers = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isLoading,
		isError
	} = useMySubscribersQuery()

	const handleRetry = useCallback(() => {
		return refetch()
	}, [refetch])

	const renderEmpty = useCallback(() => {
		if (isLoading) {
			return <UserListSkeleton count={12} actionsCount={0} />
		}

		if (isError) {
			return (
				<LoadQueryErrorRetry
					text={t('LoadQueryErrorRetry.label.failedToLoadSubscribers')}
					buttonText={t('LoadQueryErrorRetry.action.tryAgain')}
					onRetry={handleRetry}
				/>
			)
		}

		return (
			<View style={{ flex: 1 }} className="items-center justify-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
					{t('EmptyListText.noSubscribers')}
				</Text>
			</View>
		)
	}, [isLoading, isError, t, handleRetry])

	const renderFooter = useCallback(() => {
		if (isError && subscribers.length > 0) {
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
	}, [isError, subscribers.length, isFetchingNextPage, t, handleRetry])

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
				<HeaderBack>{t('SubscribersPage.header')}</HeaderBack>
				<FlashList
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
							onRefresh={() => refetchAndHaptics(handleRetry)}
							tintColor={Colors['green-main']}
						/>
					}
					ListFooterComponent={renderFooter}
					ListEmptyComponent={renderEmpty}
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
