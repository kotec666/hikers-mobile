import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { deleteMyAccount, editProfileData, getProfileData, IProfile } from '@/api/profile'
import { getActivities, IActivity } from '@/api/activities'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useToast } from '@/hooks/useToast'
import { confirmEmailCode } from '@/api/auth'

export const useProfileQuery = () =>
	useQuery<IProfile>({
		queryKey: QUERY_KEYS.MY_PROFILE,
		queryFn: async () => {
			try {
				return await getProfileData()
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		}
	})

export const useMyActivitiesQuery = () =>
	useQuery<IActivity[]>({
		queryKey: QUERY_KEYS.MY_ACTIVITIES,
		queryFn: async () => {
			try {
				return await getActivities()
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		}
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

export const useConfirmEmailMutation = () => {
	// const queryClient = useQueryClient()
	// const toast = useToast()
	return useMutation({
		mutationFn: ({ email, code }: { email: string; code: string }) => confirmEmailCode(email, code)
	})
}

export const useDeleteProfileMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: deleteMyAccount,
		onSuccess: () => {
			toast.success('Аккаунт успешно удален')
			queryClient.clear()
		},
		onError: async (e) => {
			await getFieldsErrors(e)
		}
	})
}
