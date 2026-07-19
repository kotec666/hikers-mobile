import React, { useCallback } from 'react'
import { View, ActivityIndicator, RefreshControl } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { Colors } from '@/constants/Colors'
import { ITrainingMember } from '@/api/posts'
import { useLocalSearchParams } from 'expo-router'
import { LegendList } from '@legendapp/list/react-native'
import RoundedCheckMarkSvg from '@/components/svg/RoundedCheckMark'
import RoundedPlusSvg from '@/components/svg/RoundedPlusSvg'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useAuthStore } from '@/store/authStore'
import { useWorkoutMembersQuery } from '@/queries/workout'
import { useToggleSubscribeMutation } from '@/queries/subscriptions'
import { Page } from '@/components/ui/Page'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'

const MemberItem = ({ item, currentUserId }: { item: ITrainingMember; currentUserId?: string; postId: string }) => {
	const { mutateAsync: toggleSubscribe, isPending: isPendingSubscribe } = useToggleSubscribeMutation()

	const handleSubscribe = useCallback(async () => {
		if (!item.user.id) return

		await toggleSubscribe({
			userId: item.user.id,
			isSubscribed: item.isSubscribed
		})
	}, [item.isSubscribed, item.user.id, toggleSubscribe])

	const needIcon = item.user.id !== currentUserId

	let icon = null
	if (needIcon) {
		icon = item.isSubscribed ? (
			<RoundedCheckMarkSvg color={item.user.color} width={28} height={28} />
		) : (
			<RoundedPlusSvg color={item.user.color} width={28} height={28} />
		)
	}

	return (
		<PeopleListItem
			id={item.user.id}
			name={item.user.name}
			username={item.user.username}
			avatar={item.user.avatarFilename ? `${PATH_TO_IMAGE}${item.user.avatarFilename}` : null}
			icon={{
				iconSvg: icon,
				iconCb: handleSubscribe
			}}
			isIconDisabled={isPendingSubscribe}
		/>
	)
}

const Members = () => {
	const { id } = useLocalSearchParams<{ id: string }>()
	const { user } = useAuthStore()

	const {
		data: members = [],
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		refetch,
		isRefetching
	} = useWorkoutMembersQuery(id)

	const renderMemberItem = useCallback(
		({ item }: { item: ITrainingMember }) => <MemberItem item={item} currentUserId={user?.id} postId={id} />,
		[id, user?.id]
	)

	const renderFooter = () => {
		if (!isFetchingNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}

	return (
		<Page>
			<Container className="gap-[20px] flex-1">
				<HeaderBack>Участники тренировки</HeaderBack>
				<LegendList
					data={members}
					renderItem={renderMemberItem}
					keyExtractor={(item) => item.id}
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
							onRefresh={() => refetchAndHaptics(refetch)}
							tintColor={Colors['green-main']}
						/>
					}
					ListFooterComponent={renderFooter}
					contentContainerStyle={{
						paddingBottom: 50,
						paddingTop: 10
					}}
				/>
			</Container>
		</Page>
	)
}

export default Members
