import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import AllowGeolocation from '@/components/BottomSheets/AllowGeolocation'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import { Alert, AppState, Dimensions, Linking, PermissionsAndroid, Platform } from 'react-native'
import EnableGPS from '@/components/BottomSheets/EnableGPS'
import AllowBackgroundGeolocation from '@/components/BottomSheets/AllowBackgroundGeolocation'
import AllowDeniedGeolocation from '@/components/BottomSheets/AllowDeniedGeolocation'
import * as Location from 'expo-location'
import * as Notification from 'expo-notifications'
import AllowTrackPhysicalActivity from '@/components/BottomSheets/AllowTrackPhysicalActivity'
import AllowNotifications from '@/components/BottomSheets/AllowNotifications'

const { height: screenHeight } = Dimensions.get('screen')

interface IProps {
	allPermissionsGrantedCallback?: () => void
}

/**
 *
 * Компонент, в котором проверяются + включаются geolocation permissions (+GPS)
 *
 * 1. запрос foreground (обязательно)
 * 2. запрос background (обязательно)
 * 2.5 запрос AllowDeniedGeolocation (если canAskAgain: false)
 * 3. запрос GPS (только андроид)
 * 4. запрос Push notifications (если откажется, то и foreground сервис физ. активности не регистрируется)
 * 5. запрос Physical activity tracking
 *
 */

export interface AllGeolocationPermissionsHandle {
	checkPermissions: () => Promise<void>
}

const AllGeolocationPermissions = forwardRef<AllGeolocationPermissionsHandle, IProps>((props, ref) => {
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
				return checkIsGPSEnabled()
			} else {
				await Linking.openSettings()
				return checkIsGPSEnabled()
			}
		} catch (error) {
			console.error('Error opening settings:', error)
			Alert.alert('Ошибка', 'Не удалось открыть настройки')
			setWasInSettings(false)
		}
	}

	const cancelTrackPhysicalActivityPermissions = () => {
		closeBottomSheet()
		props.allPermissionsGrantedCallback?.()
	}

	const allowPhysicalActivityPermission = async () => {
		closeBottomSheet()

		const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION)

		if (result === PermissionsAndroid.RESULTS.GRANTED) {
			props.allPermissionsGrantedCallback?.()
		} else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
			// Открываем настройки, потому что запросить повторно уже нельзя
			setWasInSettings(true)
			await Linking.openSettings()
		} else if (result === PermissionsAndroid.RESULTS.DENIED) {
			cancelTrackPhysicalActivityPermissions()
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

	const cancelNotificationsPermissions = () => {
		closeBottomSheet()
		props.allPermissionsGrantedCallback?.()
	}

	const allowNotificationPermission = async () => {
		closeBottomSheet()
		const { status } = await Notification.requestPermissionsAsync()
		if (status === 'granted') {
			return checkPhysicalActivityTrackPermission()
		}
	}

	const checkNotificationPermission = async () => {
		// if (Platform.OS === 'android') { @TODO
		const { granted, canAskAgain } = await Notification.getPermissionsAsync()

		if (granted) {
			return checkPhysicalActivityTrackPermission()
		} else if (!granted && canAskAgain) {
			return openBottomSheet(
				<AllowNotifications allow={allowNotificationPermission} close={cancelNotificationsPermissions} />
			)
		} else if (!granted && !canAskAgain) {
			return cancelNotificationsPermissions()
		}
	}

	const allowGPS = async () => {
		closeBottomSheet()
		await Location.enableNetworkProviderAsync()
		const servicesEnabled = await Location.hasServicesEnabledAsync()

		if (servicesEnabled) {
			//  @TODO только для android, проверить как работает на ios
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

	const checkPhysicalActivityTrackPermission = async () => {
		// if (Platform.OS === 'android') { @TODO
		// const { granted, canAskAgain } = await Notification.getPermissionsAsync()
		const isGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION) // 2

		if (isGranted) {
			// if (granted) {
			return props.allPermissionsGrantedCallback?.()
		} else {
			return openBottomSheet(
				<AllowTrackPhysicalActivity
					allow={allowPhysicalActivityPermission}
					close={cancelTrackPhysicalActivityPermissions}
				/>
			)
		}
		// else if (result === PermissionsAndroid.RESULTS.DENIED) {
		// 	return cancelTrackPhysicalActivityPermissions()
		// }
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

	useImperativeHandle(ref, () => ({
		checkPermissions: checkForegroundPermission
	}))

	return (
		<BottomSheet ref={bottomSheetRef} activeHeight={screenHeight * 0.5}>
			{bottomSheetContent}
		</BottomSheet>
	)
})

AllGeolocationPermissions.displayName = 'AllGeolocationPermissions'

export default AllGeolocationPermissions
