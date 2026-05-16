import { InfiniteData, QueryClient } from '@tanstack/react-query'
import { ISubscribe } from '@/api/subscribers'
import { IUser } from '@/store/authStore'
import { QUERY_KEYS } from '@/constants/query-keys'
import { INotMyProfile } from '@/api/profile'
import { IPost, ITrainingMember } from '@/api/posts'

export const findUserInCacheForSubscription = (userId: string, queryClient: QueryClient): IUser | undefined => {
	// 1. из подписок
	const subs = queryClient.getQueryData<InfiniteData<ISubscribe[]>>(QUERY_KEYS.MY_SUBSCRIPTIONS)
	const fromSubs = subs?.pages.flat().find((s) => s.user.id === userId)?.user
	if (fromSubs) return fromSubs

	// 2. из профиля
	const profile = queryClient.getQueryData<INotMyProfile>([...QUERY_KEYS.USER_PROFILE, userId])
	if (profile?.user) return profile.user

	// 3. из feed
	const feed = queryClient.getQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_FEED)
	const fromFeed = feed?.pages.flat().find((p) => p.userCreator.id === userId)?.userCreator
	if (fromFeed) return fromFeed

	// 4. из деталей постов
	const details = queryClient.getQueriesData<IPost>({ queryKey: QUERY_KEYS.POST_DETAILS })
	for (const [, post] of details) {
		if (post?.userCreator.id === userId) return post.userCreator
	}

	// 5. из участников тренировок
	const members = queryClient.getQueriesData<InfiniteData<ITrainingMember[]>>({
		queryKey: QUERY_KEYS.WORKOUT_MEMBERS
	})

	for (const [, data] of members) {
		const found = data?.pages.flat().find((m) => m.user.id === userId)?.user
		if (found) return found
	}

	// 6. из постов пользователя
	const userPosts = queryClient.getQueryData<InfiniteData<IPost[]>>([...QUERY_KEYS.POSTS_NOT_MY_PROFILE, userId])

	const fromUserPosts = userPosts?.pages.flat().find((p) => p.userCreator.id === userId)?.userCreator
	if (fromUserPosts) return fromUserPosts

	return undefined
}
