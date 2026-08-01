import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 5 * 60 * 1000, // 5 минут
			gcTime: 10 * 60 * 1000, // 10 минут
			refetchOnMount: false, // Не перезапрашивать при монтировании
			refetchOnWindowFocus: false, // Не перезапрашивать при фокусе окна
			refetchOnReconnect: false, // Не перезапрашивать при переподключении
			retry: 1
		}
	}
})
