import { InfiniteData, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getSubscriptionsList, ISubscribe, subscribeToUser, unsubscribeFromUser } from '@/api/subscribers'
import { QUERY_KEYS } from '@/constants/query-keys'
import { IPost, ITrainingMember } from '@/api/posts'
import { INotMyProfile, IProfile } from '@/api/profile'
import { findUserInCacheForSubscription } from '@/queries/query-helpers'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'

export const useMySubscriptionsQuery = (limit = 15) =>
	useInfiniteQuery<ISubscribe[], Error, ISubscribe[], typeof QUERY_KEYS.MY_SUBSCRIPTIONS, number>({
		queryKey: QUERY_KEYS.MY_SUBSCRIPTIONS,
		queryFn: async ({ pageParam }) => {
			try {
				return await getSubscriptionsList({
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

// подписка / отписка (на/от) пользователя
export const useToggleSubscribeMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ userId, isSubscribed }: { userId: string; isSubscribed: boolean }) => {
			if (isSubscribed) {
				return unsubscribeFromUser(userId)
			}
			return subscribeToUser(userId)
		},
		onMutate: async ({ userId, isSubscribed }) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.POSTS_FEED }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.POST_DETAILS }), // намеренно не так [...QUERY_KEYS.POST_DETAILS, postId]
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_PROFILE }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_SUBSCRIPTIONS }),
				queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.USER_PROFILE, userId] }),
				queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.POSTS_NOT_MY_PROFILE, userId] }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.WORKOUT_MEMBERS }) // намеренно не так [...QUERY_KEYS.WORKOUT_MEMBERS, postId]
			])

			const previousFeed = queryClient.getQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_FEED)
			const previousDetails = queryClient.getQueriesData<IPost>({ queryKey: QUERY_KEYS.POST_DETAILS }) // намеренно не так [...QUERY_KEYS.POST_DETAILS, postId]
			const previousProfile = queryClient.getQueryData<IProfile>(QUERY_KEYS.MY_PROFILE)
			const previousSubscriptions = queryClient.getQueryData<InfiniteData<ISubscribe[]>>(
				QUERY_KEYS.MY_SUBSCRIPTIONS
			)
			const previousNotMyProfile = queryClient.getQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId])
			const previousNotMyProfilePosts = queryClient.getQueryData<InfiniteData<IPost[]>>([
				...QUERY_KEYS.POSTS_NOT_MY_PROFILE,
				userId
			])
			const previousWorkoutMembers = queryClient.getQueriesData<InfiniteData<ITrainingMember[]>>({
				queryKey: QUERY_KEYS.WORKOUT_MEMBERS // намеренно не так [...QUERY_KEYS.WORKOUT_MEMBERS, postId]
			})
			const newSubscriptionUser = findUserInCacheForSubscription(userId, queryClient) // так сделано, чтобы не передавать целиком пользователя при подписке

			const updateSinglePost = (post: IPost, isSubscribed: boolean): IPost => ({
				...post,
				isSubscribed: !isSubscribed
			})

			const updateInfinite = (data: InfiniteData<IPost[]> | undefined, userId: string, isSubscribed: boolean) => {
				if (!data) return data

				return {
					...data,
					pages: data.pages.map((page) =>
						page.map((post) =>
							post.userCreator.id === userId ? updateSinglePost(post, isSubscribed) : post
						)
					)
				}
			}

			// обновляем feed
			queryClient.setQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_FEED, (old) =>
				updateInfinite(old, userId, isSubscribed)
			)

			// обновляем детали поста ( намеренно не так [...QUERY_KEYS.POST_DETAILS, postId] )
			queryClient.setQueriesData<IPost>({ queryKey: QUERY_KEYS.POST_DETAILS }, (old) => {
				if (!old) return old
				if (old.userCreator.id !== userId) return old

				return {
					...old,
					isSubscribed: !old.isSubscribed
				}
			})

			// обновляем профиль
			queryClient.setQueryData<IProfile>(QUERY_KEYS.MY_PROFILE, (old) => {
				if (!old) return old
				return {
					...old,
					subscriptions: Math.max(0, old.subscriptions + (isSubscribed ? -1 : 1))
				}
			})

			// обновляем страницу подписок
			queryClient.setQueryData<InfiniteData<ISubscribe[]>>(QUERY_KEYS.MY_SUBSCRIPTIONS, (old) => {
				if (!old) return old
				if (!newSubscriptionUser) return old

				if (isSubscribed) {
					return {
						...old,
						pages: old.pages.map(
							(page) => page.filter((subscription) => subscription.user.id !== newSubscriptionUser.id) // удаляется из списка
						)
					}
				} else {
					const exists = old.pages.some((page) => page.some((s) => s.user.id === newSubscriptionUser.id))
					if (exists) return old

					const newSubscription = {
						user: newSubscriptionUser,
						createdAt: new Date().toISOString()
					}

					return {
						...old,
						pages: [[newSubscription], ...old.pages]
					}
				}
			})

			// обновляем чужой профиль
			queryClient.setQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId], (old) => {
				if (!old) return old
				return {
					...old,
					isSubscribed: !old.isSubscribed,
					subscribers: Math.max(0, old.subscribers + (isSubscribed ? -1 : 1))
				}
			})

			// обновляем чужой профиль посты
			queryClient.setQueryData<InfiniteData<IPost[]>>([...QUERY_KEYS.POSTS_NOT_MY_PROFILE, userId], (old) =>
				updateInfinite(old, userId, isSubscribed)
			)

			// обновляем участников тренировки в посте ( намеренно не так [...QUERY_KEYS.WORKOUT_MEMBERS, postId] )
			queryClient.setQueriesData<InfiniteData<ITrainingMember[]>>(
				{ queryKey: QUERY_KEYS.WORKOUT_MEMBERS },
				(old) => {
					if (!old) return old

					return {
						...old,
						pages: old.pages.map((page) =>
							page.map((member) =>
								member.user.id === userId ? { ...member, isSubscribed: !member.isSubscribed } : member
							)
						)
					}
				}
			)

			return {
				previousFeed,
				previousDetails,
				previousProfile,
				previousSubscriptions,
				previousNotMyProfile,
				previousNotMyProfilePosts,
				previousWorkoutMembers
			}
		},
		onError: (_err, { userId }, context) => {
			// rollback если ошибка
			console.log('Ошибка при подписке/отписке на/от пользователя', _err)
			if (!context) return

			queryClient.setQueryData(QUERY_KEYS.POSTS_FEED, context.previousFeed)
			context.previousDetails.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data)
			}) // намеренно не так [...QUERY_KEYS.POST_DETAILS, postId]
			queryClient.setQueryData(QUERY_KEYS.MY_PROFILE, context.previousProfile)
			queryClient.setQueryData(QUERY_KEYS.MY_SUBSCRIPTIONS, context.previousSubscriptions)
			queryClient.setQueryData([...QUERY_KEYS.USER_PROFILE, userId], context.previousNotMyProfile)
			queryClient.setQueryData([...QUERY_KEYS.POSTS_NOT_MY_PROFILE, userId], context.previousNotMyProfilePosts)
			context.previousWorkoutMembers.forEach(([queryKey, data]) => {
				queryClient.setQueryData(queryKey, data)
			}) // намеренно не так [...QUERY_KEYS.WORKOUT_MEMBERS, postId]
		}
	})
}
