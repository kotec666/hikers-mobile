import { SearchType } from '@shared/enums'
import { IPostTraining } from '@/api/posts'
import fetcher from '@/api/fetcher'
import { toQs } from '@/helpers/toQs'

export interface IFoundUser {
	id: string
	email: string
	name: null | string
	username: null | string
	avatarFilename: null | string
}

export interface IFoundPost {
	id: string
	training: IPostTraining
	title: string
	createdAt: string
}

// Поиск люди / посты
export const searchByAllItems = async (data: {
	type: SearchType
	word: string
	page: number
	limit: number
}): Promise<IFoundUser[] | IFoundPost[]> => {
	return (await fetcher.get(`search?${toQs(data)}`)).json()
}
