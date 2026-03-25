import { io, Socket } from 'socket.io-client'
import { api } from '@/constants/Variables'
import { getItem } from '@/store/storage'

export const SOCKET_NOTIFICATIONS_EVENTS = {
	NOTIFICATION: 'notification'
	// ERROR: 'error'
}

export const createSocket = (): null | Socket => {
	const accessToken = getItem('authData')?.accessToken ?? null
	if (!accessToken) {
		return null
	}
	return io(api, {
		path: '/ws',
		query: {
			auth: `Bearer ${accessToken}`
		},
		transports: ['websocket'],
		autoConnect: true,
		forceNew: true,
		reconnection: true,
		reconnectionDelay: 500,
		reconnectionDelayMax: 5000,
		reconnectionAttempts: Infinity
	})
}
