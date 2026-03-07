import { useCallback, useEffect, useRef, useState } from 'react'

interface FetchParams<T> {
	page: number
	limit: number
	[key: string]: any
}

interface UsePaginatedListParams<T, V> {
	fetchFn: (params: FetchParams<V>) => Promise<T[]>
	limit?: number
	initialPage?: number
	autoLoad?: boolean
}

export const usePaginatedList = <T, V>({
	fetchFn,
	limit = 10,
	initialPage = 1,
	autoLoad = true
}: UsePaginatedListParams<T, V>) => {
	const [data, setData] = useState<T[]>([])
	const [loading, setLoading] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
	const [hasMore, setHasMore] = useState(true)

	const extraParamsRef = useRef<Record<string, any>>({})
	const pageRef = useRef(initialPage)
	const mountedRef = useRef(true)

	useEffect(() => {
		return () => {
			mountedRef.current = false
		}
	}, [])

	const fetchPage = useCallback(
		async (page: number, mode: 'append' | 'replace', extraParams?: Record<string, any>) => {
			if (!mountedRef.current) return

			if (mode === 'append') {
				setLoading(true)
			} else {
				setRefreshing(true)
			}

			try {
				const result = await fetchFn({ page, limit, ...extraParams })

				if (!mountedRef.current) return

				setData((prev) => (mode === 'append' ? [...prev, ...result] : result))

				setHasMore(result.length === limit)
				pageRef.current = page
			} finally {
				if (!mountedRef.current) return
				setLoading(false)
				setRefreshing(false)
			}
		},
		[fetchFn, limit]
	)

	const loadMore = useCallback(() => {
		if (loading || refreshing || !hasMore) return
		const nextPage = pageRef.current + 1
		fetchPage(nextPage, 'append', extraParamsRef.current)
	}, [fetchPage, loading, refreshing, hasMore])

	const refresh = useCallback(
		(extraParams?: Record<string, any>) => {
			if (refreshing) return

			pageRef.current = initialPage
			setHasMore(true)
			if (extraParams) {
				extraParamsRef.current = extraParams
			}
			fetchPage(initialPage, 'replace', extraParamsRef.current)
		},
		[fetchPage, refreshing, initialPage]
	)

	useEffect(() => {
		pageRef.current = initialPage
		setData([])
		setHasMore(true)

		if (autoLoad) {
			fetchPage(initialPage, 'replace')
		}
	}, [])

	return {
		data,
		setData,
		loading,
		refreshing,
		hasMore,
		loadMore,
		refresh
	}
}
