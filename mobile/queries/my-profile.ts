import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import {
	deleteMyAccount,
	editProfileBadge,
	editProfileColor,
	editProfileData,
	getProfileData,
	IProfile
} from '@/api/profile'
import { getActivities, IActivity } from '@/api/activities'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useToast } from '@/hooks/useToast'
import { confirmEmailCode } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'

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

export const useUpdateProfileColorMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()
	const { user, setUser } = useAuthStore()

	return useMutation({
		mutationFn: (color: string) => editProfileColor(color),
		onMutate: async (color) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_PROFILE })

			const prevMyProfile = queryClient.getQueryData<IProfile>(QUERY_KEYS.MY_PROFILE)
			const prevColor = user?.color

			// Мой профиль
			queryClient.setQueryData<IProfile>(QUERY_KEYS.MY_PROFILE, (old) => {
				if (!old) return old
				return {
					...old,
					user: { ...old.user, color }
				}
			})

			if (user) {
				setUser({ ...user, color })
			}

			return { prevMyProfile, prevColor }
		},
		onError: async (e, _color, context) => {
			await getFieldsErrors(e)
			if (context?.prevMyProfile) {
				queryClient.setQueryData(QUERY_KEYS.MY_PROFILE, context.prevMyProfile)
			}
			if (user && context?.prevColor) {
				setUser({ ...user, color: context.prevColor })
			}
		},
		onSuccess: async () => {
			toast.success('Цвет успешно обновлен')
		}
	})
}

export const useUpdateProfileBadgeMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()
	const { user, setUser } = useAuthStore()

	return useMutation({
		mutationFn: (badge: string) => editProfileBadge(badge),
		onMutate: async (badge) => {
			await queryClient.cancelQueries({ queryKey: QUERY_KEYS.MY_PROFILE })

			const prevMyProfile = queryClient.getQueryData<IProfile>(QUERY_KEYS.MY_PROFILE)

			// Мой профиль
			queryClient.setQueryData<IProfile>(QUERY_KEYS.MY_PROFILE, (old) => {
				if (!old) return old
				return {
					...old,
					user: { ...old.user, badge }
				}
			})

			if (user) {
				setUser({ ...user, badge })
			}

			return { prevMyProfile }
		},
		onError: async (e, _badge, context) => {
			await getFieldsErrors(e)
			if (context?.prevMyProfile) {
				queryClient.setQueryData(QUERY_KEYS.MY_PROFILE, context.prevMyProfile)
			}
		},
		onSuccess: async () => {
			toast.success('Значок успешно обновлен')
		}
	})
}

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
	const toast = useToast()

	return useMutation({
		mutationFn: deleteMyAccount,
		onSuccess: () => {
			toast.success('Аккаунт успешно удален')
		},
		onError: async (e) => {
			await getFieldsErrors(e)
		}
	})
}
