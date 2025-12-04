import fetcher from '@/api/fetcher'
import { MeasuringUnit, UserActivity } from '@shared/enums'

export interface IActivity {
	name: UserActivity
	measuringUnit: MeasuringUnit
	place: null | number
	goal: number
}

// Получить топ N активностей юзера (ближе к началу списка = выше в топе)
export const getActivities = async (): Promise<IActivity[]> => {
	return (await fetcher.get(`activities`)).json()
}
