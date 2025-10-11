import React, { useCallback, useEffect, useRef, useState } from 'react'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import AllowGeolocation from '@/components/BottomSheets/AllowGeolocation'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import { Alert, AppState, Dimensions, Linking, Platform } from 'react-native'
import EnableGPS from '@/components/BottomSheets/EnableGPS'
import AllowBackgroundGeolocation from '@/components/BottomSheets/AllowBackgroundGeolocation'
import * as Location from 'expo-location'
import AllowDeniedGeolocation from '@/components/BottomSheets/AllowDeniedGeolocation'

const { height: screenHeight } = Dimensions.get('screen')

/**
 *
 * Компонент, в котором проверяются + включаются geolocation permissions (+GPS)
 *
 * 1. запрос foreground
 * 2. запрос background
 * 3. запрос GPS
 *
 */

const AllGeolocationPermissions = () => {
	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const [bottomSheetContent, setBottomSheetContent] = useState<React.ReactNode>(null)
	const [appState, setAppState] = useState(AppState.currentState)
	const [wasInSettings, setWasInSettings] = useState(false)

	const openBottomSheet = useCallback((newContent: React.ReactNode) => {
		setBottomSheetContent(newContent)
		if (bottomSheetRef.current) {
			bottomSheetRef.current.openSheet()
		}
	}, [])

	const closeBottomSheet = useCallback(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current.closeSheet()
			setBottomSheetContent(null)
		}
	}, [])

	useEffect(() => {
		const subscription = AppState.addEventListener('change', async (nextAppState) => {
			console.log('nextAppState', nextAppState)
			// Если возвращаемся из background/inactive в active и были в настройках
			if (wasInSettings && appState.match(/inactive|background/) && nextAppState === 'active') {
				// Returned from settings, checking permissions
				setWasInSettings(true)

				setTimeout(async () => {
					await checkForegroundPermission()
				}, 500)
			}

			setAppState(nextAppState)
		})

		return () => {
			subscription.remove()
		}
	}, [appState, wasInSettings])

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

	const allowForegroundLocationPermission = async () => {
		closeBottomSheet()
		const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync()

		if (foregroundStatus === 'granted') {
			await checkBackgroundPermission()
		}
	}

	const allowBackgroundLocationPermission = async () => {
		const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync()

		if (backgroundStatus === 'granted') {
			return checkIsGPSEnabled()
		}
	}

	const checkIsGPSEnabled = async () => {
		const isGPSEnabled = await Location.hasServicesEnabledAsync()
		if (!isGPSEnabled) {
			openBottomSheet(<EnableGPS allow={closeBottomSheet} close={closeBottomSheet} />) // @TODO
		}
	}

	const checkForegroundPermission = async () => {
		const { granted, canAskAgain } = await Location.getForegroundPermissionsAsync()

		if (!granted && canAskAgain) {
			openBottomSheet(<AllowGeolocation allow={allowForegroundLocationPermission} close={closeBottomSheet} />)
		} else if (!granted && !canAskAgain) {
			openBottomSheet(<AllowDeniedGeolocation allow={openAppSettings} close={closeBottomSheet} />)
		}
	}

	const checkBackgroundPermission = async () => {
		const { granted, canAskAgain } = await Location.getBackgroundPermissionsAsync()

		if (!granted && canAskAgain) {
			openBottomSheet(
				<AllowBackgroundGeolocation allow={allowBackgroundLocationPermission} close={closeBottomSheet} />
			)
		} else if (!granted && !canAskAgain) {
			openBottomSheet(<AllowDeniedGeolocation allow={openAppSettings} close={closeBottomSheet} />)
		}
	}

	useEffect(() => {
		checkForegroundPermission()
	}, [])

	return (
		<BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
			{bottomSheetContent}
		</BottomSheet>
	)
}

export default AllGeolocationPermissions
