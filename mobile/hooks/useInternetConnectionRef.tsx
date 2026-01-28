import { useEffect, useRef } from 'react'
import { getNetworkStateAsync, addNetworkStateListener } from 'expo-network'

const CHECK_URL = 'https://clients3.google.com/generate_204'

export const useInternetConnectionRef = () => {
	const isInternetConnectedRef = useRef<boolean>(false)
	const hasNetworkRef = useRef<boolean>(false)
	const checkInProgressRef = useRef<boolean>(false)

	const checkInternetReachable = async () => {
		if (checkInProgressRef.current) return

		checkInProgressRef.current = true

		try {
			const controller = new AbortController()
			const timeout = setTimeout(() => controller.abort(), 3000)

			const res = await fetch(CHECK_URL, {
				method: 'GET',
				signal: controller.signal
			})

			clearTimeout(timeout)

			isInternetConnectedRef.current = res.status === 204 || res.ok
		} catch {
			isInternetConnectedRef.current = false
		} finally {
			checkInProgressRef.current = false
		}
	}

	useEffect(() => {
		;(async () => {
			const state = await getNetworkStateAsync()

			hasNetworkRef.current = Boolean(state.isConnected)
			isInternetConnectedRef.current = false

			if (hasNetworkRef.current) {
				await checkInternetReachable()
			}
		})()

		const subscription = addNetworkStateListener(({ isConnected }) => {
			hasNetworkRef.current = Boolean(isConnected)

			if (!isConnected) {
				isInternetConnectedRef.current = false
				return
			}

			checkInternetReachable()
		})

		return () => subscription.remove()
	}, [])

	return isInternetConnectedRef
}
