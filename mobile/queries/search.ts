import { useInfiniteQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { IFoundPost, IFoundUser, searchByAllItems } from '@/api/search'
import { SearchType } from '@shared/enums'

export const useSearchQuery = (word: string, type: SearchType, limit = 15) =>
	useInfiniteQuery<
		IFoundUser[] | IFoundPost[],
		Error,
		(IFoundUser | IFoundPost)[],
		[...typeof QUERY_KEYS.SEARCH_GLOBAL, string, SearchType],
		number
	>({
		queryKey: [...QUERY_KEYS.SEARCH_GLOBAL, word, type],
		enabled: word.trim().length >= 2,
		queryFn: ({ pageParam = 1, signal }) => {
			return searchByAllItems(
				{
					page: pageParam,
					limit,
					word,
					type
				},
				signal
			)
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < limit) return undefined
			return pages.length + 1
		},
		select: (data) => data.pages.flat()
	})
