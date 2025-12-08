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
import AllowDeniedNotifications from '@/components/BottomSheets/AllowDeniedNotifications'

const { height: screenHeight } = Dimensions.get('screen')

interface IProps {
	allPermissionsGrantedCallback?: () => void
}

/**
 *
 * Компонент, в котором проверяются + включаются geolocation permissions (+GPS) + notifications + physical activity track
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
	const appStateRef = useRef(AppState.currentState)
	const wasInSettingsRef = useRef(false)

	const openBottomSheet = useCallback((newContent: React.ReactNode) => {
		setBottomSheetContent(newContent)
		if (bottomSheetRef.current) {
			requestAnimationFrame(() => bottomSheetRef.current?.openSheet())
		}
	}, [])

	const closeBottomSheet = useCallback(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current?.closeSheet(() => {
				setBottomSheetContent(null)
			})
		}
	}, [])

	useEffect(() => {
		const subscription = AppState.addEventListener('change', async (nextAppState) => {
			if (
				wasInSettingsRef.current &&
				appStateRef.current.match(/inactive|background/) &&
				nextAppState === 'active'
			) {
				// Returned from settings, checking permissions
				wasInSettingsRef.current = false
				setTimeout(checkForegroundPermission, 500)
			}

			appStateRef.current = nextAppState
		})

		return () => subscription.remove()
	}, []) // appState

	const openAppSettings = async () => {
		closeBottomSheet()
		wasInSettingsRef.current = true
		try {
			if (Platform.OS === 'ios') {
				await Linking.openURL('app-settings:')
			} else {
				await Linking.openSettings()
			}
		} catch (error) {
			console.error('Error opening settings:', error)
			Alert.alert('Ошибка', 'Не удалось открыть настройки')
			wasInSettingsRef.current = false
		}
	}

	// ==========================================
	// 1. Foreground Location
	// ==========================================
	const checkForegroundPermission = async () => {
		/** Шаг 1, проверка разрешения на предоставление геолокации в активном режиме */
		const { granted, canAskAgain } = await Location.getForegroundPermissionsAsync() // ios + android

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

	const allowForegroundLocationPermission = async () => {
		const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync() // ios + android
		closeBottomSheet()

		if (foregroundStatus === 'granted') {
			await checkBackgroundPermission()
		} else {
			return
		}
	}

	// ==========================================
	// 2. Background Location
	// ==========================================
	const checkBackgroundPermission = async () => {
		/** Шаг 2, проверка разрешения на предоставление геолокации в фоновом режиме */
		const { granted, canAskAgain } = await Location.getBackgroundPermissionsAsync() // ios + android

		if (granted) {
			return checkIsGPSEnabled()
		} else if (!granted && canAskAgain) {
			return openBottomSheet(
				<AllowBackgroundGeolocation allow={allowBackgroundLocationPermission} close={closeBottomSheet} />
			)
		} else if (!granted && !canAskAgain) {
			return openBottomSheet(<AllowDeniedGeolocation allow={openAppSettings} close={closeBottomSheet} />)
		}
	}

	const allowBackgroundLocationPermission = async () => {
		const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync() // ios + android
		closeBottomSheet()

		if (backgroundStatus === 'granted') {
			return checkIsGPSEnabled()
		} else {
			return
		}
	}

	// ==========================================
	// 3. GPS Enabled
	// ==========================================
	const checkIsGPSEnabled = async () => {
		/** Шаг 3, проверка включен ли GPS на устройстве */
		const isGPSEnabled = await Location.hasServicesEnabledAsync() // ios + android

		if (!isGPSEnabled) {
			return openBottomSheet(
				<EnableGPS allow={Platform.OS === 'ios' ? openAppSettings : allowGPS} close={closeBottomSheet} />
			)
		} else {
			return checkNotificationPermission()
		}
	}

	const allowGPS = async () => {
		closeBottomSheet()
		try {
			await Location.enableNetworkProviderAsync() // android only
			const servicesEnabled = await Location.hasServicesEnabledAsync()
			if (servicesEnabled) {
				await checkNotificationPermission()
			}
		} catch (e) {
			console.log('User denied enabling GPS services', e)
		}
	}

	// ==========================================
	// 4. Notifications (Android only)
	// ==========================================
	const checkNotificationPermission = async () => {
		/** Шаг 4, проверка включены ли уведомления (имеет смысл только на android, т.к. для ios не используется foreground сервис уведомлений) */
		if (Platform.OS === 'android') {
			const { granted, canAskAgain } = await Notification.getPermissionsAsync()

			if (granted) {
				return checkPhysicalActivityTrackPermission()
			} else if (!granted && canAskAgain) {
				return openBottomSheet(
					<AllowNotifications allow={allowNotificationPermission} close={closeBottomSheet} />
				)
			} else if (!granted && !canAskAgain) {
				return openBottomSheet(<AllowDeniedNotifications allow={openAppSettings} close={closeBottomSheet} />)
			}
		} else {
			// for ios
			return checkPhysicalActivityTrackPermission()
		}
	}

	const allowNotificationPermission = async () => {
		const { status } = await Notification.requestPermissionsAsync()
		closeBottomSheet()
		if (status === 'granted') {
			return checkPhysicalActivityTrackPermission()
		} else {
			return
		}
	}

	// ==========================================
	// 5. Physical Activity (Android only)
	// ==========================================
	const checkPhysicalActivityTrackPermission = async () => {
		/** Шаг 5, проверка включен ли трек физ. активности (имеет смысл только на android) */
		if (Platform.OS === 'android') {
			const isGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION) // 2

			if (isGranted) {
				return props.allPermissionsGrantedCallback?.()
			} else {
				return openBottomSheet(
					<AllowTrackPhysicalActivity allow={allowPhysicalActivityPermission} close={closeBottomSheet} />
				)
			}
		} else {
			return props.allPermissionsGrantedCallback?.()
		}
	}

	const allowPhysicalActivityPermission = async () => {
		closeBottomSheet()

		try {
			const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION)
			if (result === PermissionsAndroid.RESULTS.GRANTED) {
				return props.allPermissionsGrantedCallback?.()
			} else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
				return openAppSettings()
			} else if (result === PermissionsAndroid.RESULTS.DENIED) {
				return
			}
		} catch (e) {
			console.warn(e)
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
