import { useEffect, useState } from 'react'
import { getNetworkStateAsync, addNetworkStateListener } from 'expo-network'

export const useInternetConnection = () => {
	const [isConnected, setIsConnected] = useState<boolean>(false)
	const [isLoading, setIsLoading] = useState<boolean>(true)

	useEffect(() => {
		let isMounted = true

		const checkInitialConnection = async () => {
			try {
				const initialStatus = await getNetworkStateAsync()
				if (isMounted) {
					setIsConnected(Boolean(initialStatus.isConnected && initialStatus.isInternetReachable))
					setIsLoading(false)
				}
			} catch (error) {
				if (isMounted) {
					setIsLoading(false)
					console.error('Failed to get network state:', error)
				}
			}
		}

		checkInitialConnection()

		const subscription = addNetworkStateListener(({ isConnected, isInternetReachable }) => {
			if (isMounted) {
				setIsConnected(Boolean(isConnected && isInternetReachable))
			}
		})

		return () => {
			isMounted = false
			subscription.remove()
		}
	}, [])

	return { isConnected, isLoading }
}
