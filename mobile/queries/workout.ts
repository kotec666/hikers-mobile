import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import {
	finishOfflineTraining,
	finishTraining,
	getExtendedDetails,
	getMyHistoryTrainings,
	IExtendedTrainingResponse,
	ITrainingHistoryItem
} from '@/api/workout'
import { getTrainingMembersByPostId, ITrainingMember } from '@/api/posts'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'

export const useWorkoutsQuery = (selectedType: string, limit = 15) =>
	useInfiniteQuery<
		ITrainingHistoryItem[],
		Error,
		ITrainingHistoryItem[],
		[...typeof QUERY_KEYS.WORKOUT_HISTORY, string],
		number
	>({
		queryKey: [...QUERY_KEYS.WORKOUT_HISTORY, selectedType],
		queryFn: async ({ pageParam }) => {
			try {
				return await getMyHistoryTrainings({
					page: pageParam,
					limit,
					finished: true,
					types: selectedType
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

export const useExtendedDetailsWorkoutQuery = (trainingId?: string) =>
	useQuery<IExtendedTrainingResponse>({
		queryKey: [...QUERY_KEYS.WORKOUT_DETAILS, trainingId],
		queryFn: async () => {
			try {
				return await getExtendedDetails(trainingId!)
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		},
		enabled: !!trainingId
		// retry: 1
	})

export const useWorkoutMembersQuery = (postId: string, limit = 15) =>
	useInfiniteQuery<
		ITrainingMember[],
		Error,
		ITrainingMember[],
		[...typeof QUERY_KEYS.WORKOUT_MEMBERS, string],
		number
	>({
		queryKey: [...QUERY_KEYS.WORKOUT_MEMBERS, postId],
		queryFn: async ({ pageParam }) => {
			try {
				return await getTrainingMembersByPostId(postId, {
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

// Мутация для завершения тренировки (онлайн/оффлайн)
export const useFinishWorkoutMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (data: { workoutId?: string; ts?: number }) => {
			if (data.workoutId) {
				return finishOfflineTraining(data.workoutId)
			} else {
				return finishTraining({ ts: data.ts })
			}
		},
		onSuccess: async () => {
			await queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.WORKOUT_HISTORY
			})
		}
		// намеренно без обработки ошибок
	})
}

// export const useDeleteWorkoutMutation = () => {
// 	const queryClient = useQueryClient()
//
// 	return useMutation({
// 		mutationFn: (workoutId: string) => deleteWorkoutById(workoutId),
// 		onMutate: async (workoutId) => {
// 			await Promise.all([
// 				queryClient.cancelQueries({ queryKey: QUERY_KEYS.POSTS_MY_PROFILE }),
// 				queryClient.cancelQueries({ queryKey: QUERY_KEYS.WORKOUT_HISTORY })
// 			])
//
// 			const prevMyPosts = queryClient.getQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_MY_PROFILE)
//
// 			const prevWorkoutQueries = queryClient.getQueriesData<InfiniteData<ITrainingHistoryItem[]>>({
// 				queryKey: QUERY_KEYS.WORKOUT_HISTORY
// 			}) // без selectedType
//
// 			// удалить связанный пост
// 			queryClient.removeQueries({
// 				queryKey: [...QUERY_KEYS.POST_BY_TRAINING, workoutId]
// 			})
//
// 			queryClient.setQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.POSTS_MY_PROFILE, (old) => {
// 				if (!old) return old
//
// 				return {
// 					...old,
// 					pages: old.pages.map((page: IPost[]) => page.filter((p) => p.training.id !== workoutId))
// 				}
// 			})
//
// 			// оптимистично обновляем ВСЕ WORKOUT_HISTORY (с разными selectedType)
// 			prevWorkoutQueries.forEach(([key, data]) => {
// 				if (!data) return
//
// 				queryClient.setQueryData<InfiniteData<ITrainingHistoryItem[]>>(key, {
// 					...data,
// 					pages: data.pages.map((page) => page.filter((w) => w.id !== workoutId))
// 				})
// 			})
//
// 			return {
// 				prevMyPosts,
// 				prevWorkoutQueries
// 			}
// 		},
// 		onError: (_, __, context) => {
// 			if (!context) return
//
// 			if (context.prevMyPosts) {
// 				queryClient.setQueryData(QUERY_KEYS.POSTS_MY_PROFILE, context.prevMyPosts)
// 			}
// 			context.prevWorkoutQueries?.forEach(([key, data]) => {
// 				queryClient.setQueryData(key, data)
// 			})
// 		}
// 	})
// }
