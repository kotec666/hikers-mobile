import { useEffect, useRef } from 'react'
import { getNetworkStateAsync, addNetworkStateListener } from 'expo-network'

export const useInternetConnectionRef = () => {
	const isInternetConnectedRef = useRef<boolean | undefined>(false)

	useEffect(() => {
		;(async () => {
			const initialStatus = await getNetworkStateAsync()
			isInternetConnectedRef.current = Boolean(initialStatus.isConnected && initialStatus.isInternetReachable)
		})()

		const subscription = addNetworkStateListener(({ isConnected, isInternetReachable }) => {
			isInternetConnectedRef.current = Boolean(isConnected && isInternetReachable)
		})

		return () => {
			subscription.remove()
		}
	}, [])

	return isInternetConnectedRef
}
