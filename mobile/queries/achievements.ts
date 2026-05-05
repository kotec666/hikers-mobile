import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import {
	getAchievements,
	getClaimedAchievementsByUserId,
	IAchievement,
	IAchievementsResponse
} from '@/api/achievements'

type AchievementsVM = {
	claimed: IAchievement[]
	unclaimed: IAchievement[]
	all: IAchievement[]
}

export const useAchievementsQuery = () =>
	useQuery<IAchievementsResponse, unknown, AchievementsVM>({
		queryKey: QUERY_KEYS.MY_ACHIEVEMENTS,
		queryFn: getAchievements,
		select: (data) => ({
			claimed: data.claimed,
			unclaimed: data.unclaimed,
			all: [...data.claimed, ...data.unclaimed]
		})
	})

export const useUserAchievementsQuery = (userId: string) =>
	useQuery<IAchievement[]>({
		queryKey: [...QUERY_KEYS.USER_ACHIEVEMENTS, userId],
		queryFn: () => getClaimedAchievementsByUserId(userId)
	})
