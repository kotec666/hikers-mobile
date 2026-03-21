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
import { subscribeToUser, unsubscribeFromUser } from '@/api/subscribers'
import { useToast } from '@/hooks/useToast'
import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'

const membersQueryKey = (postId: string) => ['training-members', postId] as const

const MemberItem = ({
	item,
	currentUserId,
	postId,
	queryKey
	// setMembers
}: {
	item: ITrainingMember
	currentUserId?: string
	postId: string
	queryKey: ReturnType<typeof membersQueryKey>
	// setMembers: React.Dispatch<React.SetStateAction<ITrainingMember[]>>
}) => {
	const toast = useToast()
	const queryClient = useQueryClient()

	const mutation = useMutation({
		mutationKey: ['subscribe', item.user.id],
		mutationFn: async (subscribe: boolean) => {
			if (subscribe) {
				await subscribeToUser(item.user.id)
			} else {
				await unsubscribeFromUser(item.user.id)
			}
		},

		onMutate: async (subscribe) => {
			await queryClient.cancelQueries({ queryKey })

			const previous = queryClient.getQueryData<InfiniteData<ITrainingMember[]>>(queryKey)

			queryClient.setQueryData<InfiniteData<ITrainingMember[]>>(queryKey, (old) => {
				if (!old) return old

				return {
					...old,
					pages: old.pages.map((page: ITrainingMember[]) =>
						page.map((member) =>
							member.user.id === item.user.id ? { ...member, isSubscribed: subscribe } : member
						)
					)
				}
			})

			return { previous }
		},

		onError: (_err, _vars, ctx) => {
			if (ctx?.previous) {
				queryClient.setQueryData(queryKey, ctx.previous)
			}
			toast.error('Произошла ошибка')
		},

		onSuccess: (_data, subscribe) => {
			toast.success(`Вы ${subscribe ? 'подписались на' : 'отписались от'} пользователя`)
		}
	})

	// const {
	// 	value: isSubscribed,
	// 	toggle: toggleSubscribe,
	// 	isLoading: isSubscribeLoading
	// } = useOptimisticToggle({
	// 	initialValue: item.isSubscribed,
	// 	onEnable: async () => {
	// 		await subscribeToUser(item.user.id)
	// 	},
	// 	onDisable: async () => {
	// 		await unsubscribeFromUser(item.user.id)
	// 	},
	// 	onError: () => {
	// 		toast.error('Произошла ошибка')
	// 		console.error('Ошибка при подписке/отписке')
	// 	},
	// 	onSuccess: (val) => {
	// 		toast.success(`Вы ${val ? 'подписались на' : 'отписались от'} пользователя`)
	// 		setMembers((prev) =>
	// 			prev.map((member) => (member.user.id === item.user.id ? { ...member, isSubscribed: val } : member))
	// 		)
	// 	}
	// })

	// const needIcon = item.user.id !== currentUserId
	//
	// let icon = null
	// if (needIcon) {
	// 	icon = isSubscribed ? (
	// 		<RoundedCheckMarkSvg color={item.colorHex} width={28} height={28} />
	// 	) : (
	// 		<RoundedPlusSvg color={item.colorHex} width={28} height={28} />
	// 	)
	// }

	const isSubscribed = item.isSubscribed
	const isSubscribeLoading = mutation.isPending

	const toggleSubscribe = () => mutation.mutate(!isSubscribed)

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
	const queryKey = membersQueryKey(id)
	const limit = 10

	const {
		data: members = [],
		isFetchingNextPage,
		fetchNextPage,
		hasNextPage,
		refetch,
		isRefetching
	} = useInfiniteQuery({
		queryKey,
		queryFn: async ({ pageParam = 1 }) => {
			try {
				return await getTrainingMembersByPostId(id, {
					page: pageParam,
					limit
				})
			} catch (e) {
				console.error(e)
				toast.error('Не удалось загрузить участников')
				throw e
			}
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, allPages) => {
			if (!lastPage || lastPage.length < limit) return undefined
			return allPages.length + 1
		},
		select: (data) => data.pages.flat()
	})

	const renderMemberItem = useCallback(
		({ item }: { item: ITrainingMember }) => (
			<MemberItem
				item={item}
				currentUserId={user?.id}
				postId={id}
				queryKey={queryKey}
				// setMembers={setMembers}
			/>
		),
		[id, user?.id] // setMembers
	)

	const renderFooter = () => {
		// if (!loading) return null
		if (!isFetchingNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="gap-[20px] mt-[20px] flex-1">
				<HeaderBack>Участники тренировки</HeaderBack>
				<LegendList
					data={members}
					renderItem={renderMemberItem}
					keyExtractor={(item) => item.id}
					//onEndReached={loadMore}
					onEndReached={() => {
						if (hasNextPage && !isFetchingNextPage) {
							fetchNextPage()
						}
					}}
					onEndReachedThreshold={0.5}
					ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
					// refreshControl={
					// 	<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={Colors['green-main']} />
					// }
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={refetch}
							tintColor={Colors['green-main']}
						/>
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
