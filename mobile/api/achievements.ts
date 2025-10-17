import fetcher from '@/api/fetcher'

export interface IAchievement {
	id: string
	iconFilename: null | string
	colorHex: null | string
	title: string
	description: null | string
	claimedPercent: string
	claimedAt: null | string
}

export const getClaimedAchievements = async (): Promise<IAchievement[]> => {
	return (await fetcher.get(`achievements/claimed`)).json()
}

export const getUnclaimedAchievements = async (): Promise<IAchievement[]> => {
	return (await fetcher.get(`achievements/unclaimed`)).json()
}
