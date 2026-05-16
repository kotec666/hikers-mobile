import { useEffect, useRef } from 'react'
import { getNetworkStateAsync, addNetworkStateListener } from 'expo-network'
import { checkConnectivity } from '@/api/204'

const TIMEOUT_MS = 3000

export const useInternetConnectionRef = () => {
	const isInternetConnectedRef = useRef(false)
	const hasNetworkRef = useRef(false)
	const checkInProgressRef = useRef(false)
	const controllerRef = useRef<AbortController | null>(null)

	const checkInternetReachable = async () => {
		if (checkInProgressRef.current) return

		checkInProgressRef.current = true

		controllerRef.current?.abort()
		const controller = new AbortController()
		controllerRef.current = controller

		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

		try {
			const res = await checkConnectivity(controller)
			isInternetConnectedRef.current = res.status === 204 || res.ok
		} catch {
			isInternetConnectedRef.current = false
		} finally {
			clearTimeout(timeout)
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
				controllerRef.current?.abort()
				isInternetConnectedRef.current = false
				return
			}

			return checkInternetReachable()
		})

		return () => {
			controllerRef.current?.abort()
			subscription.remove()
		}
	}, [])

	return isInternetConnectedRef
}
