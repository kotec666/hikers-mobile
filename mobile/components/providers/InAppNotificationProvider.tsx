import { useEffect, useRef } from 'react'
import { Socket } from 'socket.io-client'
import { createSocket, SOCKET_NOTIFICATIONS_EVENTS } from '@/api/socket'
import { INotification } from '@/api/notifications'
import { useToast } from '@/hooks/useToast'
import { handleRedirectOnPageWhenNotificationPressed } from '@/components/ui/Notifications/NotificationListItem'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'

const InAppNotificationProvider = () => {
	const socketRef = useRef<Socket | null>(null)
	const toast = useToast()
	const { push } = useSafeNavigation()

	useEffect(() => {
		if (socketRef.current) socketRef.current.disconnect()
		const s = createSocket()
		if (!s) return // accessToken = null
		socketRef.current = s

		// const onConnect = () => {
		// 	console.log('socket io connected')
		// }

		const onNotification = (socketData: INotification) => {
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

		return () => {
			s.disconnect()
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	return <></>
}

export default InAppNotificationProvider
