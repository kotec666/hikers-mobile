import React, { useEffect, useState, useCallback } from 'react'
import { View, ActivityIndicator } from 'react-native'
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
	const { id } = useLocalSearchParams<{ id: string }>()
	const { user } = useAuthStore()
	const [members, setMembers] = useState<ITrainingMember[]>([])
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const limit = 10

	const loadMembers = useCallback(
		async (pageNum: number, isRefresh = false) => {
			if (loading && !isRefresh) return
			setLoading(true)

			try {
				const newMembers = await getTrainingMembersByPostId(id, { page: pageNum, limit })

				if (isRefresh) {
					setMembers(newMembers)
				} else {
					setMembers((prev) => [...prev, ...newMembers])
				}

				setHasMore(newMembers.length === limit)
			} catch (error) {
				console.error('Ошибка при загрузке участников:', error)
			} finally {
				setLoading(false)
			}
		},
		[id, loading]
	)

	useEffect(() => {
		loadMembers(1, true)
	}, [id])

	const loadMore = useCallback(() => {
		if (hasMore && !loading) {
			const nextPage = page + 1
			setPage(nextPage)
			loadMembers(nextPage)
		}
	}, [hasMore, loading, page, loadMembers])

	const renderMemberItem = useCallback(
		({ item }: { item: ITrainingMember }) => (
			<MemberItem item={item} currentUserId={user?.id} setMembers={setMembers} />
		),
		[user?.id]
	)

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px] mt-[20px] flex-1">
				<HeaderBack>Участники тренировки</HeaderBack>
				{/*<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>*/}
				{/*	Люди*/}
				{/*</Text>*/}

				<LegendList
					data={members}
					renderItem={renderMemberItem}
					keyExtractor={(item) => item.id.toString()}
					onEndReached={loadMore}
					onEndReachedThreshold={0.5}
					ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
					ListFooterComponent={
						loading ? (
							<View style={{ padding: 20 }}>
								<ActivityIndicator size="small" color={Colors['green-main']} />
							</View>
						) : null
					}
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
