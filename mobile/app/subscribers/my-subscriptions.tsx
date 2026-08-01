import React, { useCallback } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { fontFamily } from '@/constants/Fonts'
import RoundedMinusSvg from '@/components/svg/RoundedMinusSvg'
import { ISubscribe } from '@/api/subscribers'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { Colors } from '@/constants/Colors'
import { useMySubscriptionsQuery, useToggleSubscribeMutation } from '@/queries/subscriptions'
import { Page } from '@/components/ui/Page'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { FlashList } from '@shopify/flash-list'
import LoadQueryErrorRetry from '@/components/LoadQueryErrorRetry'
import { UserListSkeleton } from '@/components/ui/skeleton'

/**
 * Мои подписки, на кого подписан я
 * */
const MySubscriptionsPage = () => {
	const {
		data: subscriptions = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isLoading,
		isError
	} = useMySubscriptionsQuery()

	const { mutateAsync: toggleSubscribe, isPending: isPendingSubscribe } = useToggleSubscribeMutation()

	const handleRetry = useCallback(() => {
		return refetch()
	}, [refetch])

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

	const renderFooter = useCallback(() => {
		if (isError && subscriptions.length > 0) {
			return <LoadQueryErrorRetry text="Не удалось загрузить ещё" buttonText="Повторить" onRetry={handleRetry} />
		}
		if (!isFetchingNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [isFetchingNextPage, isError, subscriptions.length, handleRetry])

	const renderEmpty = useCallback(() => {
		if (isLoading) {
			return <UserListSkeleton count={12} />
		}

		if (isError) {
			return <LoadQueryErrorRetry text="Не удалось загрузить подписки" onRetry={handleRetry} />
		}

		return (
			<View style={{ flex: 1 }} className="items-center justify-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
					Вы ни на кого не подписаны
				</Text>
			</View>
		)
	}, [isLoading, isError, handleRetry])

	return (
		<Page>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] flex-1">
					<HeaderBack>Подписки</HeaderBack>
					<FlashList
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
								onRefresh={() => refetchAndHaptics(handleRetry)}
								tintColor={Colors['green-main']}
							/>
						}
						ListFooterComponent={renderFooter}
						ListEmptyComponent={renderEmpty}
						contentContainerStyle={{
							paddingBottom: 50,
							paddingTop: 10,
							flex: subscriptions.length === 0 ? 1 : undefined
						}}
					/>
				</Container>
			</View>
		</Page>
	)
}

export default MySubscriptionsPage
