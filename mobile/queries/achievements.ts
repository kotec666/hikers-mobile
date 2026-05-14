import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import {
	getAchievements,
	getClaimedAchievementsByUserId,
	IAchievement,
	IAchievementsResponse
} from '@/api/achievements'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'

type AchievementsVM = {
	claimed: IAchievement[]
	unclaimed: IAchievement[]
	all: IAchievement[]
}

export const useAchievementsQuery = () =>
	useQuery<IAchievementsResponse, unknown, AchievementsVM>({
		queryKey: QUERY_KEYS.MY_ACHIEVEMENTS,
		queryFn: async () => {
			try {
				return await getAchievements()
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		},
		select: (data) => ({
			claimed: data.claimed,
			unclaimed: data.unclaimed,
			all: [...data.claimed, ...data.unclaimed]
		})
	})

export const useUserAchievementsQuery = (userId: string) =>
	useQuery<IAchievement[]>({
		queryKey: [...QUERY_KEYS.USER_ACHIEVEMENTS, userId],
		queryFn: async () => {
			try {
				return await getClaimedAchievementsByUserId(userId)
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		}
	})
