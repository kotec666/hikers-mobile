import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import {
	acceptFriendRequest,
	addAsFriend,
	deleteFriendById,
	getMyFriendsList,
	getPendingInvitesList,
	IFriend,
	IInvite,
	rejectFriendRequest,
	revokeFriendInviteByUserId
} from '@/api/friends'
import { INotMyProfile, IProfile } from '@/api/profile'
import { FriendStatus } from '@shared/enums'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useToast } from '@/hooks/useToast'

export const useMyFriendsQuery = (limit = 15) =>
	useInfiniteQuery<IFriend[], Error, IFriend[], typeof QUERY_KEYS.MY_FRIENDS, number>({
		queryKey: QUERY_KEYS.MY_FRIENDS,
		queryFn: async ({ pageParam }) => {
			try {
				return await getMyFriendsList({
					page: pageParam,
					limit
				})
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < limit) return undefined
			return pages.length + 1
		},
		select: (data) => data.pages.flat()
	})

export const useMyFriendRequestsQuery = (limit = 15) =>
	useInfiniteQuery<IInvite[], Error, IInvite[], typeof QUERY_KEYS.MY_FRIEND_REQUESTS, number>({
		queryKey: QUERY_KEYS.MY_FRIEND_REQUESTS,
		queryFn: async ({ pageParam }) => {
			try {
				return await getPendingInvitesList({
					page: pageParam,
					limit
				})
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < limit) return undefined
			return pages.length + 1
		},
		select: (data) => data.pages.flat()
	})

// Принять заявку в друзья
export const useAcceptFriendRequestMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: (userId: string) => acceptFriendRequest(userId),
		onMutate: async (userId) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_PROFILE }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_FRIENDS }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_FRIEND_REQUESTS }),
				queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.USER_PROFILE, userId] })
			])

			const prevMyProfile = queryClient.getQueryData<IProfile>(QUERY_KEYS.MY_PROFILE)
			const prevUserProfile = queryClient.getQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId])
			const prevFriendRequests = queryClient.getQueryData<InfiniteData<IInvite>>(QUERY_KEYS.MY_FRIEND_REQUESTS)
			const prevFriends = queryClient.getQueryData<InfiniteData<IFriend[]>>(QUERY_KEYS.MY_FRIENDS)
			const requestUser =
				prevFriendRequests?.pages.flat().find((req) => req.user.id === userId)?.user ?? prevUserProfile?.user // так сделано, чтобы не передавать целиком пользователя при добавлении в друзья

			// Мой профиль
			queryClient.setQueryData<IProfile>(QUERY_KEYS.MY_PROFILE, (old) => {
				if (!old) return old
				return {
					...old,
					friends: old.friends + 1
				}
			})

			// Профиль пользователя
			queryClient.setQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId], (old) => {
				if (!old) return old

				return {
					...old,
					friends: old.friends + 1,
					isFriend: FriendStatus.TRUE
				}
			})

			// Заявки в друзья
			queryClient.setQueryData<InfiniteData<IInvite[]>>(QUERY_KEYS.MY_FRIEND_REQUESTS, (old) => {
				if (!old) return old

				return {
					...old,
					pages: old.pages.map((page) => page.filter((req) => req.user.id !== userId))
				}
			})

			// Мои друзья
			queryClient.setQueryData<InfiniteData<IFriend[]>>(QUERY_KEYS.MY_FRIENDS, (old) => {
				if (!old) return old
				if (!requestUser) return old

				const newFriend = {
					user: requestUser,
					createdAt: new Date().toISOString()
				}

				return {
					...old,
					pages: [[newFriend], ...old.pages]
				}
			})

			return { prevMyProfile, prevUserProfile, prevFriendRequests, prevFriends }
		},
		onSuccess: () => {
			toast.success('Пользователь добавлен в друзья')
		},
		onError: async (e, userId, context) => {
			await getFieldsErrors(e)
			if (context?.prevMyProfile) {
				queryClient.setQueryData(QUERY_KEYS.MY_PROFILE, context.prevMyProfile)
			}
			if (context?.prevUserProfile) {
				queryClient.setQueryData([...QUERY_KEYS.USER_PROFILE, userId], context.prevUserProfile)
			}
			if (context?.prevFriendRequests) {
				queryClient.setQueryData(QUERY_KEYS.MY_FRIEND_REQUESTS, context.prevFriendRequests)
			}
			if (context?.prevFriends) {
				queryClient.setQueryData(QUERY_KEYS.MY_FRIENDS, context.prevFriends)
			}
		}
	})
}

// Удалить из друзей
export const useRemoveFriendMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: (userId: string) => deleteFriendById(userId),
		onMutate: async (userId) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_PROFILE }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_FRIENDS }),
				queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.USER_PROFILE, userId] })
			])

			const prevMyProfile = queryClient.getQueryData<IProfile>(QUERY_KEYS.MY_PROFILE)
			const prevFriends = queryClient.getQueryData(QUERY_KEYS.MY_FRIENDS)
			const prevUserProfile = queryClient.getQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId])

			// Мой профиль
			queryClient.setQueryData<IProfile>(QUERY_KEYS.MY_PROFILE, (old) => {
				if (!old) return old
				return {
					...old,
					friends: Math.max(0, old.friends - 1)
				}
			})

			// Страница списка друзей
			queryClient.setQueryData<InfiniteData<IFriend[]>>(QUERY_KEYS.MY_FRIENDS, (old) => {
				if (!old) return old

				return {
					...old,
					pages: old.pages.map((page) => page.filter((friend) => friend.user.id !== userId))
				}
			})

			// Профиль пользователя
			queryClient.setQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId], (old) => {
				if (!old) return old

				return {
					...old,
					isFriend: FriendStatus.FALSE,
					friends: Math.max(0, old.friends - 1)
				}
			})

			return { prevMyProfile, prevFriends, prevUserProfile }
		},
		onSuccess: () => {
			toast.success('Пользователь удалён из списка друзей')
		},
		onError: async (e, userId, context) => {
			await getFieldsErrors(e)
			if (context?.prevMyProfile) {
				queryClient.setQueryData(QUERY_KEYS.MY_PROFILE, context.prevMyProfile)
			}
			if (context?.prevFriends) {
				queryClient.setQueryData(QUERY_KEYS.MY_FRIENDS, context.prevFriends)
			}
			if (context?.prevUserProfile) {
				queryClient.setQueryData([...QUERY_KEYS.USER_PROFILE, userId], context.prevUserProfile)
			}
		}
	})
}

// Отклонить заявку в друзья
export const useRejectFriendMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: (userId: string) => rejectFriendRequest(userId),
		onMutate: async (userId) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_FRIEND_REQUESTS }),
				queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.USER_PROFILE, userId] })
			])

			const prevFriendRequests = queryClient.getQueryData(QUERY_KEYS.MY_FRIEND_REQUESTS)
			const prevUserProfile = queryClient.getQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId])

			// Страница списка заявок в друзья
			queryClient.setQueryData<InfiniteData<IInvite[]>>(QUERY_KEYS.MY_FRIEND_REQUESTS, (old) => {
				if (!old) return old

				return {
					...old,
					pages: old.pages.map((page) => page.filter((friendRequest) => friendRequest.user.id !== userId))
				}
			})

			// Профиль пользователя
			queryClient.setQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId], (old) => {
				if (!old) return old

				return {
					...old,
					isFriend: FriendStatus.FALSE
				}
			})

			return { prevFriendRequests, prevUserProfile }
		},
		onSuccess: () => {
			toast.success('Заявка отклонена')
		},
		onError: async (e, userId, context) => {
			await getFieldsErrors(e)
			if (context?.prevFriendRequests) {
				queryClient.setQueryData(QUERY_KEYS.MY_FRIEND_REQUESTS, context.prevFriendRequests)
			}
			if (context?.prevUserProfile) {
				queryClient.setQueryData([...QUERY_KEYS.USER_PROFILE, userId], context.prevUserProfile)
			}
		}
	})
}

// Отправить заявку в друзья
export const useSendFriendRequestMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: (userId: string) => addAsFriend(userId),
		onMutate: async (userId) => {
			await queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.USER_PROFILE, userId] })

			const prevUserProfile = queryClient.getQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId])

			// Профиль пользователя
			queryClient.setQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId], (old) => {
				if (!old) return old

				return {
					...old,
					isFriend: FriendStatus.INVITED
				}
			})

			return { prevUserProfile }
		},
		onSuccess: () => {
			toast.success('Заявка в друзья отправлена')
		},
		onError: async (e, userId, context) => {
			await getFieldsErrors(e)
			if (context?.prevUserProfile) {
				queryClient.setQueryData([...QUERY_KEYS.USER_PROFILE, userId], context.prevUserProfile)
			}
		}
	})
}

// Отозвать запрос в друзья
export const useRevokeRequestMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: (userId: string) => revokeFriendInviteByUserId(userId),
		onMutate: async (userId) => {
			await queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.USER_PROFILE, userId] })

			const prevUserProfile = queryClient.getQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId])

			// Профиль пользователя
			queryClient.setQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId], (old) => {
				if (!old) return old

				return {
					...old,
					isFriend: FriendStatus.FALSE
				}
			})

			return { prevUserProfile }
		},
		onSuccess: () => {
			toast.success('Заявка в друзья отозвана')
		},
		onError: async (e, userId, context) => {
			await getFieldsErrors(e)
			if (context?.prevUserProfile) {
				queryClient.setQueryData([...QUERY_KEYS.USER_PROFILE, userId], context.prevUserProfile)
			}
		}
	})
}
