import fetcher from '@/api/fetcher'

export const checkConnectivity = (controller: AbortController) => {
	return fetcher.get(`generate_204`, {
		signal: controller.signal,
		throwHttpErrors: false // важно: 204 не должен кидать исключение
	})
}
