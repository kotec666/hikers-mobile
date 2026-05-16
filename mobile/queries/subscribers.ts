import { useInfiniteQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getSubscribersList, ISubscribe } from '@/api/subscribers'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'

export const useMySubscribersQuery = (limit = 15) =>
	useInfiniteQuery<ISubscribe[], Error, ISubscribe[], typeof QUERY_KEYS.MY_SUBSCRIBERS, number>({
		queryKey: QUERY_KEYS.MY_SUBSCRIBERS,
		queryFn: async ({ pageParam }) => {
			try {
				return await getSubscribersList({
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
