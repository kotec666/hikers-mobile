import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import AllowGeolocation from '@/components/BottomSheets/AllowGeolocation'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import { Alert, AppState, Dimensions, Linking, Platform } from 'react-native'
import EnableGPS from '@/components/BottomSheets/EnableGPS'
import AllowBackgroundGeolocation from '@/components/BottomSheets/AllowBackgroundGeolocation'
import AllowDeniedGeolocation from '@/components/BottomSheets/AllowDeniedGeolocation'
import AllowNotifications from '@/components/BottomSheets/AllowNotifications'
import * as Location from 'expo-location'
import * as Notification from 'expo-notifications'

const { height: screenHeight } = Dimensions.get('screen')

interface IProps {
	retryPermissions: boolean
	allPermissionsGrantedCallback?: () => void
}

/**
 *
 * Компонент, в котором проверяются + включаются geolocation permissions (+GPS)
 *
 * 1. запрос foreground
 * 2. запрос background
 * 3. запрос GPS
 *
 */

const AllGeolocationPermissions = (props: IProps) => {
	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const [bottomSheetContent, setBottomSheetContent] = useState<React.ReactNode>(null)
	const [appState, setAppState] = useState(AppState.currentState)
	const [wasInSettings, setWasInSettings] = useState(false)

	const openBottomSheet = useCallback((newContent: React.ReactNode) => {
		setBottomSheetContent(newContent)
		if (bottomSheetRef.current) {
			requestAnimationFrame(() => bottomSheetRef.current?.openSheet())
		}
	}, [])

	const closeBottomSheet = useCallback(() => {
		if (bottomSheetRef.current) {
			requestAnimationFrame(() => bottomSheetRef.current?.closeSheet())
			setBottomSheetContent(null)
		}
	}, [])

	useEffect(() => {
		const subscription = AppState.addEventListener('change', async (nextAppState) => {
			// Если возвращаемся из background/inactive в active и были в настройках
			if (wasInSettings && appState.match(/inactive|background/) && nextAppState === 'active') {
				// Returned from settings, checking permissions
				setWasInSettings(false)
				setTimeout(checkForegroundPermission, 500)
			}

			setAppState(nextAppState)
		})

		return () => subscription.remove()
	}, [])

	const openAppSettings = async () => {
		try {
			closeBottomSheet()
			setWasInSettings(true)

			if (Platform.OS === 'ios') {
				await Linking.openURL('app-settings:')
			} else {
				await Linking.openSettings()
			}
		} catch (error) {
			console.error('Error opening settings:', error)
			Alert.alert('Ошибка', 'Не удалось открыть настройки')
			setWasInSettings(false)
		}
	}

	const cancelNotificationsPermissions = () => {
		closeBottomSheet()
		props.allPermissionsGrantedCallback?.()
	}

	const allowNotificationPermission = async () => {
		closeBottomSheet()
		const { status } = await Notification.requestPermissionsAsync()

		if (status === 'granted') {
			props.allPermissionsGrantedCallback?.()
		} else {
			props.allPermissionsGrantedCallback?.()
		}
	}

	const allowForegroundLocationPermission = async () => {
		closeBottomSheet()
		const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync()

		if (foregroundStatus === 'granted') {
			await checkBackgroundPermission()
		}
	}

	const allowBackgroundLocationPermission = async () => {
		closeBottomSheet()
		const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync()

		if (backgroundStatus === 'granted') {
			return checkIsGPSEnabled()
		}
	}

	const allowGPS = async () => {
		closeBottomSheet()
		await Location.enableNetworkProviderAsync()
		const servicesEnabled = await Location.hasServicesEnabledAsync()

		if (servicesEnabled) {
			return checkNotificationPermission()
		}
	}

	const checkIsGPSEnabled = async () => {
		// @TODO только для android, проверить как работает на ios
		// if (Platform.OS === 'ios') return
		const isGPSEnabled = await Location.hasServicesEnabledAsync()
		if (!isGPSEnabled) {
			openBottomSheet(<EnableGPS allow={allowGPS} close={closeBottomSheet} />)
		} else {
			return checkNotificationPermission()
		}
	}

	const checkNotificationPermission = async () => {
		const { granted, canAskAgain } = await Notification.getPermissionsAsync()

		if (granted) {
			return props.allPermissionsGrantedCallback?.()
		} else if (!granted && canAskAgain) {
			return openBottomSheet(
				<AllowNotifications allow={allowNotificationPermission} close={cancelNotificationsPermissions} />
			)
		} else if (!granted && !canAskAgain) {
			return cancelNotificationsPermissions()
		}
	}

	const checkForegroundPermission = async () => {
		const { granted, canAskAgain } = await Location.getForegroundPermissionsAsync()

		if (granted) {
			return checkBackgroundPermission()
		} else if (!granted && canAskAgain) {
			return openBottomSheet(
				<AllowGeolocation allow={allowForegroundLocationPermission} close={closeBottomSheet} />
			)
		} else if (!granted && !canAskAgain) {
			return openBottomSheet(<AllowDeniedGeolocation allow={openAppSettings} close={closeBottomSheet} />)
		}
	}

	const checkBackgroundPermission = async () => {
		const { granted, canAskAgain } = await Location.getBackgroundPermissionsAsync()

		if (granted) {
			return checkIsGPSEnabled()
		} else if (!granted && canAskAgain) {
			openBottomSheet(
				<AllowBackgroundGeolocation allow={allowBackgroundLocationPermission} close={closeBottomSheet} />
			)
		} else if (!granted && !canAskAgain) {
			openBottomSheet(<AllowDeniedGeolocation allow={openAppSettings} close={closeBottomSheet} />)
		}
	}

	useEffect(() => {
		checkForegroundPermission()
	}, [props.retryPermissions])

	return (
		<BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
			{bottomSheetContent}
		</BottomSheet>
	)
}

export default AllGeolocationPermissions
