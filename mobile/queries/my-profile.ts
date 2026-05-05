import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { deleteMyAccount, editProfileData, getProfileData, IProfile } from '@/api/profile'
import { getActivities, IActivity } from '@/api/activities'

export const useProfileQuery = () =>
	useQuery<IProfile>({
		queryKey: QUERY_KEYS.MY_PROFILE,
		queryFn: getProfileData
	})

export const useMyActivitiesQuery = () =>
	useQuery<IActivity[]>({
		queryKey: QUERY_KEYS.MY_ACTIVITIES,
		queryFn: getActivities
	})

export const useUpdateProfileMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (updatedData: FormData) => editProfileData(updatedData),
		onSuccess: (data) => {
			queryClient.setQueryData(QUERY_KEYS.MY_PROFILE, data)
		}
	})
}

export const useDeleteProfileMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: deleteMyAccount,
		onSuccess: () => {
			queryClient.clear()
		}
	})
}
