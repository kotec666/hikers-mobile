import { InfiniteData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/constants/query-keys'
import { changeNotificationSettings, getNotificationSettings, NotificationSettings } from '@/api/settings'
import {
	checkIsUnreadNotificationsExists,
	deleteNotificationsById,
	getNotificationsList,
	INotification,
	INotificationUnread,
	markNotificationsAsReadById
} from '@/api/notifications'
import { NotificationType } from '@shared/enums'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useToast } from '@/hooks/useToast'

export const useNotificationsListQuery = (limit = 15) =>
	useInfiniteQuery<INotification[], Error, INotification[], typeof QUERY_KEYS.NOTIFICATIONS_LIST, number>({
		queryKey: QUERY_KEYS.NOTIFICATIONS_LIST,
		queryFn: async ({ pageParam }) => {
			try {
				return await getNotificationsList({
					page: pageParam,
					limit
				})
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < limit) return undefined
			return pages.length + 1
		},
		select: (data) => data.pages.flat()
	})

export const useUnreadNotificationsQuery = () =>
	useQuery<INotificationUnread>({
		queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD,
		queryFn: async () => {
			try {
				return await checkIsUnreadNotificationsExists()
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		}
	})

export const useNotificationsSettingsQuery = () =>
	useQuery<NotificationSettings>({
		queryKey: QUERY_KEYS.NOTIFICATIONS_SETTINGS,
		queryFn: async () => {
			try {
				return await getNotificationSettings()
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		}
	})

export const useOnNewNotificationMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: async (newNotification: INotification) => {
			// ничего не делаем, просто прокидываем данные дальше
			return newNotification
		},
		onMutate: async (newNotification: INotification) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_LIST }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD })
			])

			const previousNotifications = queryClient.getQueryData<InfiniteData<INotification[]>>(
				QUERY_KEYS.NOTIFICATIONS_LIST
			)
			const previousUnread = queryClient.getQueryData<INotificationUnread>(QUERY_KEYS.NOTIFICATIONS_UNREAD)

			// Список уведомлений
			queryClient.setQueryData<InfiniteData<INotification[]>>(QUERY_KEYS.NOTIFICATIONS_LIST, (old) => {
				if (!old) return old

				return {
					...old,
					pages: [[newNotification], ...old.pages]
				}
			})

			// Непрочитанные
			queryClient.setQueryData<INotificationUnread>(QUERY_KEYS.NOTIFICATIONS_UNREAD, () => {
				return { exists: true }
			})

			// Инвалидация по типу уведомления
			switch (newNotification.type) {
				case NotificationType.FRIEND_INVITE:
					await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_FRIEND_REQUESTS })
					break
				case NotificationType.TAGGED_IN_POST:
					await Promise.all([
						queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE }), // намеренно сделано не [...QUERY_KEYS.USER_PROFILE, userId]
						queryClient.invalidateQueries({ queryKey: QUERY_KEYS.POSTS_FEED }),
						queryClient.invalidateQueries({
							queryKey: [...QUERY_KEYS.POST_DETAILS, newNotification.action.relEntityId]
						})
					])
					break
				case NotificationType.NEW_ACHIEVEMENT:
					await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_ACHIEVEMENTS })
					break
				case NotificationType.TRAINING_INVITE:
					// queryClient.invalidateQueries({ queryKey: QUERY_KEYS.TRAINING_INVITES })
					break
			}

			return {
				previousNotifications,
				previousUnread
			}
		},
		onError: async (e, _ids, context) => {
			// rollback если ошибка
			await getFieldsErrors(e)
			if (context?.previousNotifications) {
				queryClient.setQueryData(QUERY_KEYS.NOTIFICATIONS_LIST, context.previousNotifications)
			}
			if (context?.previousUnread) {
				queryClient.setQueryData(QUERY_KEYS.NOTIFICATIONS_UNREAD, context.previousUnread)
			}
		}
	})
}

export const useUpdateNotificationsSettingsMutation = () => {
	const queryClient = useQueryClient()
	const toast = useToast()

	return useMutation({
		mutationFn: (updatedData: NotificationSettings) => changeNotificationSettings(updatedData),
		onSuccess: (_data, updatedData) => {
			toast.success('Настройки уведомлений сохранены')
			queryClient.setQueryData<NotificationSettings>(QUERY_KEYS.NOTIFICATIONS_SETTINGS, () => updatedData)
		},
		onError: async (e, _ids, _context) => {
			await getFieldsErrors(e)
		}
	})
}

export const useDeleteNotificationsMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (ids: string[]) => deleteNotificationsById({ ids }),
		onMutate: async (ids) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_LIST }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD })
			])

			const previousNotificationsData = queryClient.getQueryData<InfiniteData<INotification[]>>(
				QUERY_KEYS.NOTIFICATIONS_LIST
			)

			queryClient.setQueryData<InfiniteData<INotification[]>>(QUERY_KEYS.NOTIFICATIONS_LIST, (oldData) => {
				if (!oldData) return oldData

				// удалить все
				if (!ids.length) {
					return {
						...oldData,
						pages: oldData.pages.map(() => [])
					}
				}

				// удалить конкретные
				return {
					...oldData,
					pages: oldData.pages.map((page) => page.filter((notif) => !ids.includes(notif.id)))
				}
			})

			return { previousNotificationsData }
		},
		onSuccess: async () => {
			// после успеха — обновляем unread
			await queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD
			})
		},
		onError: async (e, _ids, context) => {
			// rollback если ошибка
			await getFieldsErrors(e)
			if (context?.previousNotificationsData) {
				queryClient.setQueryData(QUERY_KEYS.NOTIFICATIONS_LIST, context.previousNotificationsData)
			}
		}
	})
}

export const useMarkNotificationsAsReadMutation = () => {
	const queryClient = useQueryClient()

	return useMutation({
		mutationFn: (ids: string[]) => markNotificationsAsReadById({ ids }),
		onMutate: async (ids) => {
			await Promise.all([
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_LIST }),
				queryClient.cancelQueries({ queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD })
			])

			const previousNotificationsData = queryClient.getQueryData<InfiniteData<INotification[]>>(
				QUERY_KEYS.NOTIFICATIONS_LIST
			)

			queryClient.setQueryData<InfiniteData<INotification[]>>(QUERY_KEYS.NOTIFICATIONS_LIST, (oldData) => {
				if (!oldData) return oldData

				return {
					...oldData,
					pages: oldData.pages.map((page) =>
						page.map((notif) =>
							ids.includes(notif.id) ? { ...notif, readedAt: new Date().toISOString() } : notif
						)
					)
				}
			})

			return { previousNotificationsData }
		},
		onSuccess: async () => {
			// синхронизация бейджа (колокольчик)
			await queryClient.invalidateQueries({
				queryKey: QUERY_KEYS.NOTIFICATIONS_UNREAD
			})
		},
		onError: async (e, _ids, context) => {
			// rollback при ошибке
			await getFieldsErrors(e)
			if (context?.previousNotificationsData) {
				queryClient.setQueryData(QUERY_KEYS.NOTIFICATIONS_LIST, context.previousNotificationsData)
			}
		}
	})
}
