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

interface IDeviceInfo {
	platform: string
	brand: string | null
	manufacturer: string | null
	modelName: string | null
	deviceName: string | null
	deviceType: string | null
	// ОС
	osName: string | null
	osVersion: string | null
	// Приложение
	appVersion: string | null
	buildNumber: string | null

	// Локаль
	locale: string

	// Экран
	screen: {
		width: number
		height: number
		scale: number
		fontScale: number
	}
}

export interface IReportData {
	type: ReportType
	relEntityId?: string
	text?: string
	deviceInfo?: IDeviceInfo
}

// Сообщить о проблеме или оставить жалобу
/**
 *
 * {
 *    type: string [ReportType]
 *    relEntityId?: string [id сущности на которую пожаловались]
 *    text?: string [описание жалобы]
 *    deviceInfo?: {
 *        platform?: string
 *        brand?: string
 *        manufacturer?: string
 *        modelName?: string
 *        deviceName?: string
 *        deviceType?: string
 *        osName?: string
 *        osVersion?: string
 *        appVersion?: string
 *        buildNumber?: string
 *        locale?: string
 *        screen?: {
 * 			width: number
 * 			height: number
 * 			scale: number
 * 			fontScale: number
 *        }
 *    }
 * }
 *
 */
export const createReport = async (data: IReportData): Promise<ISuccess> => {
	return (
		await fetcher.post('reports', {
			json: data
		})
	).json()
}

// Получение своего списка репортов
export const getReportsMy = async (data: { page: number; limit: number; types?: ReportType[] }): Promise<IReport[]> => {
	return (await fetcher.get(`reports/my?${toQs(data)}`)).json()
}
