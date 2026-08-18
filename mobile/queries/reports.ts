import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { useToast } from '@/hooks/useToast'
import { createReport, getReportsMy, IReport, IReportData } from '@/api/reports'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { ReportType } from '@shared/enums'
import { useTranslation } from 'react-i18next'

export const useCreateReportMutation = () => {
	// const queryClient = useQueryClient()
	const { t } = useTranslation()
	const toast = useToast()

	return useMutation({
		mutationFn: (reportData: IReportData) => createReport(reportData),
		onSuccess: () => {
			toast.success(t('ToastMessage.success.reportSent'))
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

export const useReportsQuery = (types?: ReportType[], limit = 5) => {
	const { t } = useTranslation()

	return useInfiniteQuery<IReport[], Error, IReport[], typeof QUERY_KEYS.MY_REPORTS, number>({
		queryKey: QUERY_KEYS.MY_REPORTS,
		queryFn: async ({ pageParam }) => {
			try {
				return await getReportsMy({
					page: pageParam,
					limit,
					types
				})
			} catch (e) {
				await getFieldsErrors(e, t)
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
}
