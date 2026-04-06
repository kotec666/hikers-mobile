import fetcher from '@/api/fetcher'

export interface IAchievement {
	id: string
	iconFilename: null | string
	colorHex: null | string
	title: string
	description: null | string
	claimedPercent: string // % от общего числа пользователей у кого есть эта ачивка
	progress: number // % получения ачивки
	claimedAt: null | string
}

export interface IAchievementsResponse {
	claimed: IAchievement[]
	unclaimed: IAchievement[]
}

export const getClaimedAchievements = async (): Promise<IAchievement[]> => {
	return (await fetcher.get(`achievements/claimed`)).json()
}

export const getClaimedAchievementsByUserId = async (userId: string): Promise<IAchievement[]> => {
	return (await fetcher.get(`achievements/claimed/${userId}`)).json()
}

export const getUnclaimedAchievements = async (): Promise<IAchievement[]> => {
	return (await fetcher.get(`achievements/unclaimed`)).json()
}

export const getAchievements = async (): Promise<IAchievementsResponse> => {
	const [unclaimed, claimed] = await Promise.all([getUnclaimedAchievements(), getClaimedAchievements()])

	return {
		unclaimed,
		claimed
	}
}
