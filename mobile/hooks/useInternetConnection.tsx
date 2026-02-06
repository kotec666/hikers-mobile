import { useEffect, useState, useRef } from 'react'
import { getNetworkStateAsync, addNetworkStateListener } from 'expo-network'
import { checkConnectivity } from '@/api/204'

const TIMEOUT_MS = 3000

export const useInternetConnection = () => {
	const [isConnected, setIsConnected] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	const controllerRef = useRef<AbortController | null>(null)
	const mountedRef = useRef(true)
	const checkInProgressRef = useRef(false)

	const checkInternetReachable = async () => {
		if (checkInProgressRef.current) return

		checkInProgressRef.current = true

		controllerRef.current?.abort()
		const controller = new AbortController()
		controllerRef.current = controller

		const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

		try {
			const res = await checkConnectivity(controller)

			if (mountedRef.current) {
				setIsConnected(res.status === 204 || res.ok)
			}
		} catch {
			if (mountedRef.current) {
				setIsConnected(false)
			}
		} finally {
			clearTimeout(timeout)

			if (mountedRef.current) {
				setIsLoading(false)
			}
			checkInProgressRef.current = false
		}
	}

	useEffect(() => {
		mountedRef.current = true
		;(async () => {
			try {
				const state = await getNetworkStateAsync()

				if (!mountedRef.current) return

				if (!state.isConnected) {
					setIsConnected(false)
					setIsLoading(false)
					return
				}

				await checkInternetReachable()
			} catch (e) {
				if (mountedRef.current) {
					setIsConnected(false)
					setIsLoading(false)
				}
			}
		})()

		const subscription = addNetworkStateListener(({ isConnected }) => {
			if (!mountedRef.current) return

			if (!isConnected) {
				setIsConnected(false)
				setIsLoading(false)
				return
			}

			checkInternetReachable()
		})

		return () => {
			mountedRef.current = false
			controllerRef.current?.abort()
			subscription.remove()
		}
	}, [])

	return { isConnected, isLoading }
}
