import { useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { createSocket, SOCKET_NOTIFICATIONS_EVENTS } from '@/api/socket'
import { INotification } from '@/api/notifications'
import { useToast } from '@/hooks/useToast'
import { handleRedirectOnPageWhenNotificationPressed } from '@/components/ui/Notifications/NotificationListItem'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useAuthStore } from '@/store/authStore'
import { useQueryClient } from '@tanstack/react-query'
import { getAuthData } from '@/services/tokenService'

const InAppNotificationProvider = () => {
	const socketRef = useRef<Socket | null>(null)
	const toast = useToast()
	const { push } = useSafeNavigation()
	const { accessTokenExpiration } = useAuthStore()
	const queryClient = useQueryClient()

	useEffect(() => {
		const setupSocket = async () => {
			const authData = await getAuthData()
			const accessToken = authData?.accessToken
			if (!accessToken) return

			if (socketRef.current) {
				socketRef.current.disconnect()
				socketRef.current = null
			}

			const s = createSocket(accessToken)
			socketRef.current = s

			// const onConnect = () => {
			// 	console.log('socket io connected')
			// }

			const onNotification = async (socketData: INotification) => {
				// инвалидируем кэш
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ['unread-exists'] }),
					queryClient.invalidateQueries({ queryKey: ['notifications-page'] })
				])

				const redirectLink = handleRedirectOnPageWhenNotificationPressed(
					socketData.type,
					socketData.action.relEntityId
				)

				const onPressNotification = () => {
					if (redirectLink) {
						return push(redirectLink)
					}
					return
				}

				toast.info(socketData.action.text, onPressNotification)
			}

			// s.on('connect', onConnect)
			s.on(SOCKET_NOTIFICATIONS_EVENTS.NOTIFICATION, onNotification)
			s.on('connect_error', (err) => {
				console.log('connect_error:', err)
				console.log('message:', err.message)
			})
		}

		setupSocket()

		return () => {
			if (socketRef.current) {
				socketRef.current.disconnect()
				socketRef.current = null
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [accessTokenExpiration])

	return null
}

export default InAppNotificationProvider
