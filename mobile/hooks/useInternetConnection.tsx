import { useEffect, useState, useRef } from 'react'
import { getNetworkStateAsync, addNetworkStateListener } from 'expo-network'

const CHECK_URL = 'https://clients3.google.com/generate_204'
const TIMEOUT_MS = 3000

export const useInternetConnection = () => {
	const [isConnected, setIsConnected] = useState(false)
	const [isLoading, setIsLoading] = useState(true)

	const mountedRef = useRef(true)
	const checkInProgressRef = useRef(false)

	const checkInternetReachable = async () => {
		if (checkInProgressRef.current) return

		checkInProgressRef.current = true

		try {
			const controller = new AbortController()
			const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)

			const res = await fetch(CHECK_URL, {
				method: 'GET',
				signal: controller.signal
			})

			clearTimeout(timeout)

			if (mountedRef.current) {
				setIsConnected(res.status === 204 || res.ok)
			}
		} catch {
			if (mountedRef.current) {
				setIsConnected(false)
			}
		} finally {
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
				return
			}

			checkInternetReachable()
		})

		return () => {
			mountedRef.current = false
			subscription.remove()
		}
	}, [])

	return { isConnected, isLoading }
}
