import fetcher from '@/api/fetcher'
import { ISuccess } from '@/api/posts'
import { ReportType } from '@shared/enums'
import { toQs } from '@/helpers/toQs'
import { IUser } from '@/store/authStore'

export interface IReport {
	id: string
	fromUser: IUser
	type: ReportType
	// addons: null
	text: null | string
	createdAt: string
	fileNames: string[]
}

// Сообщить о проблеме или оставить жалобу
/**
 *
 * {
 *    type: string [ReportType]
 *    relEntityId?: string [id сущности на которую пожаловались]
 *    text?: string [описание жалобы]
 *    files?: [массив файлов]
 * }
 *
 */
export const createReport = async (data: BodyInit): Promise<ISuccess> => {
	return (
		await fetcher.post('reports', {
			body: data
		})
	).json()
}

// Получение своего списка репортов
export const getReportsMy = async (data: { page: number; limit: number; types?: ReportType[] }): Promise<IReport[]> => {
	return (await fetcher.get(`reports/my?${toQs(data)}`)).json()
}
