import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getUserProfileData, INotMyProfile } from '@/api/profile'

export const useUserProfileQuery = (userId: string) =>
	useQuery<INotMyProfile>({
		queryKey: [...QUERY_KEYS.USER_PROFILE, userId],
		queryFn: () => getUserProfileData(userId),
		enabled: !!userId
	})
