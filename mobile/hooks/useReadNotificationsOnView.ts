import { useFocusEffect } from 'expo-router'
import { AppState, ViewToken } from 'react-native'
import { useEffect, useCallback, useRef } from 'react'

type Identifiable = {
	id: string
}

export const useReadNotificationsOnView = <T extends Identifiable>(
	readNotificationsByIds: (ids: string[]) => Promise<void>,
	isRead: (item: T) => boolean
) => {
	const bufferRef = useRef<Set<string>>(new Set())
	const flushRef = useRef<() => void>(() => {})

	const onViewableItemsChanged = useCallback(
		({ viewableItems }: { viewableItems: (ViewToken & { item: T })[] }) => {
			viewableItems.forEach(({ item }) => {
				if (!isRead(item)) {
					bufferRef.current.add(item.id)
				}
			})
		},
		[isRead]
	)

	flushRef.current = () => {
		const ids = Array.from(bufferRef.current)

		if (!ids.length) return

		bufferRef.current.clear()
		readNotificationsByIds(ids)
	}

	useFocusEffect(
		useCallback(() => {
			return () => {
				flushRef.current()
			}
		}, [])
	)

	useEffect(() => {
		const sub = AppState.addEventListener('change', (state) => {
			if (state !== 'active') {
				flushRef.current()
			}
		})

		return () => sub.remove()
	}, [])

	return {
		onViewableItemsChanged
	}
}
