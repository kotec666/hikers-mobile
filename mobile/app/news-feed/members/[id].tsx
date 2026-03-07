import React, { useCallback } from 'react'
import { View, ActivityIndicator, RefreshControl } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { Colors } from '@/constants/Colors'
import { getTrainingMembersByPostId, ITrainingMember } from '@/api/posts'
import { useLocalSearchParams } from 'expo-router'
import { LegendList } from '@legendapp/list'
import RoundedCheckMarkSvg from '@/components/svg/RoundedCheckMark'
import RoundedPlusSvg from '@/components/svg/RoundedPlusSvg'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useAuthStore } from '@/store/authStore'
import { useOptimisticToggle } from '@/hooks/useOptimisticToggle'
import { subscribeToUser, unsubscribeFromUser } from '@/api/subscribers'
import { useToast } from '@/hooks/useToast'
import { usePaginatedList } from '@/hooks/usePaginatedList'

const MemberItem = ({
	item,
	currentUserId,
	setMembers
}: {
	item: ITrainingMember
	currentUserId?: string
	setMembers: React.Dispatch<React.SetStateAction<ITrainingMember[]>>
}) => {
	const toast = useToast()
	const {
		value: isSubscribed,
		toggle: toggleSubscribe,
		isLoading: isSubscribeLoading
	} = useOptimisticToggle({
		initialValue: item.isSubscribed,
		onEnable: async () => {
			await subscribeToUser(item.user.id)
		},
		onDisable: async () => {
			await unsubscribeFromUser(item.user.id)
		},
		onError: () => {
			toast.error('Произошла ошибка')
			console.error('Ошибка при подписке/отписке')
		},
		onSuccess: (val) => {
			toast.success(`Вы ${val ? 'подписались на' : 'отписались от'} пользователя`)
			setMembers((prev) =>
				prev.map((member) => (member.user.id === item.user.id ? { ...member, isSubscribed: val } : member))
			)
		}
	})

	const needIcon = item.user.id !== currentUserId

	let icon = null
	if (needIcon) {
		icon = isSubscribed ? (
			<RoundedCheckMarkSvg color={item.colorHex} width={28} height={28} />
		) : (
			<RoundedPlusSvg color={item.colorHex} width={28} height={28} />
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
				iconCb: toggleSubscribe
			}}
			isIconDisabled={isSubscribeLoading}
		/>
	)
}

const Members = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const { id } = useLocalSearchParams<{ id: string }>()
	const { user } = useAuthStore()
	const limit = 10

	const {
		data: members,
		setData: setMembers,
		loading,
		refreshing,
		loadMore,
		refresh
	} = usePaginatedList<ITrainingMember, void>({
		fetchFn: async ({ page, limit }) => {
			try {
				return await getTrainingMembersByPostId(id, { page, limit })
			} catch (error) {
				console.error('Ошибка при загрузке участников:', error)
				toast.error('Не удалось загрузить участников')
				return []
			}
		},
		limit
	})

	const renderMemberItem = useCallback(
		({ item }: { item: ITrainingMember }) => (
			<MemberItem item={item} currentUserId={user?.id} setMembers={setMembers} />
		),
		[user?.id, setMembers]
	)

	const renderFooter = () =>
		loading ? (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		) : null

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px] mt-[20px] flex-1">
				<HeaderBack>Участники тренировки</HeaderBack>
				<LegendList
					data={members}
					renderItem={renderMemberItem}
					keyExtractor={(item) => item.id}
					onEndReached={loadMore}
					onEndReachedThreshold={0.5}
					ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
					refreshControl={
						<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors['green-main']} />
					}
					ListFooterComponent={renderFooter}
					contentContainerStyle={{
						paddingBottom: insets.bottom + 20,
						paddingTop: 10
					}}
				/>
			</Container>
		</SafeAreaProvider>
	)
}

export default Members
