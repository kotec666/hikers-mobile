import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { getUserProfileData, INotMyProfile } from '@/api/profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useTranslation } from 'react-i18next'

export const useUserProfileQuery = (userId: string) => {
	const { t } = useTranslation()

	return useQuery<INotMyProfile>({
		queryKey: [...QUERY_KEYS.USER_PROFILE, userId],
		queryFn: async () => {
			try {
				return await getUserProfileData(userId)
			} catch (e) {
				await getFieldsErrors(e, t)
				throw e
			}
		},
		enabled: !!userId
	})
}
