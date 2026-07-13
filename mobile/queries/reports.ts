import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { createReport, getReportsMy, IReport } from '@/api/reports'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { ReportType } from '@shared/enums'

export const useCreateReportMutation = () => {
	// const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: (reportData: FormData) => createReport(reportData),
		onSuccess: () => {
			toast.success('Жалоба отправлена')
			// queryClient.setQueryData<IPost>([...QUERY_KEYS.REPORT_DETAILS, newReport.id], newReport)
			// queryClient.setQueryData<InfiniteData<IPost[]>>(QUERY_KEYS.MY_REPORTS, (old) => {
			// 	if (!old) return old
			//
			// 	return {
			// 		...old,
			// 		pages: [[newReport], ...old.pages]
			// 	}
			// })
		}
	})
}

export const useReportsQuery = (types?: ReportType[], limit = 5) =>
	useInfiniteQuery<IReport[], Error, IReport[], typeof QUERY_KEYS.MY_REPORTS, number>({
		queryKey: QUERY_KEYS.MY_REPORTS,
		queryFn: async ({ pageParam }) => {
			try {
				return await getReportsMy({
					page: pageParam,
					limit,
					types
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
