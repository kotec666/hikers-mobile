import fetcher from '@/api/fetcher'

interface IAchievement {
	id: 'string'
	iconFilename: null
	colorHex: null
	title: 'string'
	description: null
	claimedPercent: 'string'
	claimedAt: null
}

export const getClaimedAchievements = async (): Promise<IAchievement[]> => {
	return (await fetcher.get(`achievements/claimed`)).json()
}
