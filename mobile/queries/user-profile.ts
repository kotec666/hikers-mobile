import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getUserProfileData, INotMyProfile } from '@/api/profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'

export const useUserProfileQuery = (userId: string) =>
	useQuery<INotMyProfile>({
		queryKey: [...QUERY_KEYS.USER_PROFILE, userId],
		queryFn: async () => {
			try {
				return await getUserProfileData(userId)
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		},
		enabled: !!userId
	})
