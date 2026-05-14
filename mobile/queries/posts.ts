import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
	createPost,
	deletePostById,
	editPostById,
	getPostById,
	getPostByTrainingId,
	getPostsByUserId,
	getPostsFeed,
	getPostsMy,
	IPost,
	likePostById,
	unlikePostById
} from '@/api/posts'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useToast } from '@/hooks/useToast'

export const useFeedPostsQuery = (limit = 5) =>
	useInfiniteQuery<IPost[], Error, IPost[], typeof QUERY_KEYS.POSTS_FEED, number>({
		queryKey: QUERY_KEYS.POSTS_FEED,
		queryFn: async ({ pageParam }) => {
			try {
				return await getPostsFeed({
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

export const useProfilePostsQuery = (limit = 5) =>
	useInfiniteQuery<IPost[], Error, IPost[], typeof QUERY_KEYS.POSTS_MY_PROFILE, number>({
		queryKey: QUERY_KEYS.POSTS_MY_PROFILE,
		queryFn: async ({ pageParam }) => {
			try {
				return await getPostsMy({
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

export const useNotMyProfilePostsQuery = (userId: string, limit = 5) =>
	useInfiniteQuery<IPost[], Error, IPost[], [...typeof QUERY_KEYS.POSTS_NOT_MY_PROFILE, string], number>({
		queryKey: [...QUERY_KEYS.POSTS_NOT_MY_PROFILE, userId],
		queryFn: async ({ pageParam }) => {
			try {
				return await getPostsByUserId(userId, {
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
		select: (data) => data.pages.flat(),
		enabled: !!userId
	})

export const usePostQuery = (postId?: string) =>
	useQuery<IPost>({
		queryKey: [...QUERY_KEYS.POST_DETAILS, postId],
		queryFn: async () => {
			try {
				return await getPostById(postId!)
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		},
		enabled: !!postId
		// retry: 1
	})

export const usePostByTrainingQuery = (trainingId?: string) =>
	useQuery({
		queryKey: [...QUERY_KEYS.POST_BY_TRAINING, trainingId],
		queryFn: async () => {
			try {
				return await getPostByTrainingId(trainingId!)
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		},
		enabled: !!trainingId
		// retry: 1
	})

export const useCreatePostMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: (postData: FormData) => createPost(postData),
		onSuccess: (newPost) => {
			toast.success('Пост опубликован')
			queryClient.setQueryData<IPost>([...QUERY_KEYS.POST_DETAILS, newPost.id], newPost)

			queryClient.setQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_MY_PROFILE, (old) => {
				if (!old) return old

				return {
					...old,
					pages: [[newPost], ...old.pages]
				}
			})
			queryClient.setQueryData<IPost>([...QUERY_KEYS.POST_BY_TRAINING, newPost.training.id], newPost)
		}
	})
}

export const useUpdatePostMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: ({ postId, data }: { postId: string; data: FormData }) => editPostById(postId, data),
		onSuccess: async (_data, updatedPost) => {
			toast.success('Пост отредактирован')
			await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS_MY_PROFILE })
			await queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.POST_DETAILS, updatedPost.postId] })
		}
	})
}

export const useDeletePostMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: (postId: string) => deletePostById(postId),
		onMutate: async (postId) => {
			const prevMyPosts = queryClient.getQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_MY_PROFILE)
			const prevPostDetails = queryClient.getQueryData<IPost>([...QUERY_KEYS.POST_DETAILS, postId])
			const trainingId = prevPostDetails?.training?.id
			const prevTrainingPost = trainingId
				? queryClient.getQueryData<IPost>([...QUERY_KEYS.POST_BY_TRAINING, trainingId])
				: undefined

			await Promise.all([
				queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.POST_DETAILS, postId] }),
				queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.POST_BY_TRAINING, trainingId] }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.POSTS_MY_PROFILE })
			])

			// удаляем из кэша
			if (trainingId) {
				queryClient.removeQueries({
					queryKey: [...QUERY_KEYS.POST_BY_TRAINING, trainingId]
				})
			}

			queryClient.removeQueries({
				queryKey: [...QUERY_KEYS.POST_DETAILS, postId]
			})

			queryClient.setQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_MY_PROFILE, (old) => {
				if (!old) return old

				return {
					...old,
					pages: old.pages.map((page: IPost[]) => page.filter((p) => p.id !== postId))
				}
			})

			return {
				prevPostDetails,
				prevMyPosts,
				prevTrainingPost,
				trainingId
			}
		},
		onSuccess: () => {
			toast.success('Пост удалён')
		},
		onError: async (e, postId, context) => {
			await getFieldsErrors(e)
			if (!context) return

			if (context.prevPostDetails) {
				queryClient.setQueryData([...QUERY_KEYS.POST_DETAILS, postId], context.prevPostDetails)
			}

			if (context.prevMyPosts) {
				queryClient.setQueryData(QUERY_KEYS.POSTS_MY_PROFILE, context.prevMyPosts)
			}

			if (context.trainingId && context.prevTrainingPost) {
				queryClient.setQueryData([...QUERY_KEYS.POST_BY_TRAINING, context.trainingId], context.prevTrainingPost)
			}
		}
	})
}

export const useToggleLikePostMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
			if (isLiked) {
				return unlikePostById(postId)
			}
			return likePostById(postId)
		},

		// optimistic update
		onMutate: async ({ postId, isLiked }) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.POSTS_FEED }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.POSTS_MY_PROFILE }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.POSTS_NOT_MY_PROFILE }),
				queryClient.cancelQueries({ queryKey: [...QUERY_KEYS.POST_DETAILS, postId] })
			])

			const previousFeed = queryClient.getQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_FEED)
			const previousProfile = queryClient.getQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_MY_PROFILE)
			const previousNotMyProfilePosts = queryClient.getQueriesData<InfiniteData<IPost[]>>({
				queryKey: QUERY_KEYS.POSTS_NOT_MY_PROFILE
			})
			const previousDetails = queryClient.getQueryData<IPost>([...QUERY_KEYS.POST_DETAILS, postId])

			const updateSinglePost = (post: IPost, isLiked: boolean): IPost => ({
				...post,
				isLiked: !isLiked,
				likesCount: Math.max(0, post.likesCount + (isLiked ? -1 : 1))
			})

			const updateInfinite = (data: InfiniteData<IPost[]> | undefined, postId: string, isLiked: boolean) => {
				if (!data) return data

				return {
					...data,
					pages: data.pages.map((page) =>
						page.map((post) => (post.id === postId ? updateSinglePost(post, isLiked) : post))
					)
				}
			}

			// обновляем feed
			queryClient.setQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_FEED, (old) =>
				updateInfinite(old, postId, isLiked)
			)

			// обновляем посты в профиле
			queryClient.setQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_MY_PROFILE, (old) =>
				updateInfinite(old, postId, isLiked)
			)

			// чужие профили
			queryClient.setQueriesData<InfiniteData<IPost[]>>({ queryKey: QUERY_KEYS.POSTS_NOT_MY_PROFILE }, (old) =>
				updateInfinite(old, postId, isLiked)
			)

			// обновляем детали поста
			queryClient.setQueryData<IPost>([...QUERY_KEYS.POST_DETAILS, postId], (old) =>
				old ? updateSinglePost(old, isLiked) : old
			)

			return {
				previousFeed,
				previousProfile,
				previousNotMyProfilePosts,
				previousDetails
			}
		},

		// rollback если ошибка
		onError: async (e, { postId }, context) => {
			console.log('Ошибка при like/unlike поста', e)
			await getFieldsErrors(e)
			if (!context) return

			queryClient.setQueryData(QUERY_KEYS.POSTS_FEED, context.previousFeed)
			queryClient.setQueryData(QUERY_KEYS.POSTS_MY_PROFILE, context.previousProfile)
			context.previousNotMyProfilePosts.forEach(([key, data]) => {
				queryClient.setQueryData(key, data)
			})
			queryClient.setQueryData([...QUERY_KEYS.POST_DETAILS, postId], context.previousDetails)
		}
	})
}
