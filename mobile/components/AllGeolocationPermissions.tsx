import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { Alert, AppState, Linking, Platform } from 'react-native'
import AllowGeolocation from '@/components/BottomSheets/AllowGeolocation'
import EnableGPS from '@/components/BottomSheets/EnableGPS'
import AllowBackgroundGeolocation from '@/components/BottomSheets/AllowBackgroundGeolocation'
import AllowDeniedGeolocation from '@/components/BottomSheets/AllowDeniedGeolocation'
import * as Location from 'expo-location'
import * as Application from 'expo-application'
import BottomSheet, { BottomSheetHandle } from '@/components/ui/BottomSheet/BottomSheet'
import { useTranslation } from 'react-i18next'

const IOS_LOCATION_SERVICES_ALERT_COOLDOWN_MS = 1500

let isIOSLocationServicesAlertVisible = false
let lastIOSLocationServicesAlertShownAt = 0

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
 * 4. запрос Push notifications DEPRECATED notifee
 * 5. запрос Physical activity tracking DEPRECATED notifee
 *
 */

export interface AllGeolocationPermissionsHandle {
	checkPermissions: () => Promise<void>
}

const AllGeolocationPermissions = forwardRef<AllGeolocationPermissionsHandle, IProps>(
	({ allPermissionsGrantedCallback }, ref) => {
		const { t } = useTranslation()
		const bottomSheetRef = useRef<BottomSheetHandle>(null)
		const [bottomSheetContent, setBottomSheetContent] = useState<React.ReactNode>(null)
		const appStateRef = useRef(AppState.currentState)
		const wasInSettingsRef = useRef(false)
		const appId = Application.applicationId

		const openBottomSheet = useCallback((newContent: React.ReactNode) => {
			setBottomSheetContent(newContent)
			if (bottomSheetRef.current) {
				requestAnimationFrame(async () => await bottomSheetRef.current?.openSheet())
			}
		}, [])

		const closeBottomSheet = useCallback(async () => {
			if (bottomSheetRef.current) {
				await bottomSheetRef.current?.closeSheet(() => {
					setBottomSheetContent(null)
				})
			}
		}, [])

		const openAppSettings = useCallback(
			async (isNotificationSetting = false) => {
				await closeBottomSheet()
				wasInSettingsRef.current = true
				try {
					if (Platform.OS === 'ios') {
						await Linking.openSettings()
					} else {
						if (isNotificationSetting) {
							await Linking.sendIntent('android.settings.APP_NOTIFICATION_SETTINGS', [
								{ key: 'android.provider.extra.APP_PACKAGE', value: appId || '' }
							])
						} else {
							await Linking.openSettings()
						}
					}
				} catch (error) {
					console.error('Error opening settings:', error)
					Alert.alert(t('common.error'), t('AllGeolocationPermissions.failedToOpenSettings'))
					wasInSettingsRef.current = false
				}
			},
			[appId, closeBottomSheet, t]
		)

		const showIOSLocationServicesAlert = useCallback(async () => {
			const now = Date.now()

			if (
				isIOSLocationServicesAlertVisible ||
				now - lastIOSLocationServicesAlertShownAt < IOS_LOCATION_SERVICES_ALERT_COOLDOWN_MS
			) {
				return
			}

			isIOSLocationServicesAlertVisible = true
			lastIOSLocationServicesAlertShownAt = now
			await closeBottomSheet()
			Alert.alert(
				t('AllGeolocationPermissions.locationServicesAreTurnedOff'),
				t('AllGeolocationPermissions.locationInstructions'),
				[
					{
						text: t('common.settings'),
						onPress: () => {
							isIOSLocationServicesAlertVisible = false
							openAppSettings()
						}
					},
					{
						text: t('common.cancel'),
						style: 'cancel',
						onPress: () => {
							isIOSLocationServicesAlertVisible = false
						}
					}
				]
			)
		}, [closeBottomSheet, openAppSettings, t])

		const checkIOSLocationServicesAndShowAlert = useCallback(
			async (granted: boolean, canAskAgain: boolean): Promise<boolean> => {
				if (Platform.OS === 'ios' && !granted && !canAskAgain) {
					const isGPSEnabled = await Location.hasServicesEnabledAsync() // ios + android

					if (!isGPSEnabled) {
						showIOSLocationServicesAlert()
						return true
					}
				}

				return false
			},
			[showIOSLocationServicesAlert]
		)

		const allowGPS = useCallback(async () => {
			await closeBottomSheet()
			try {
				await Location.enableNetworkProviderAsync() // android only
				const servicesEnabled = await Location.hasServicesEnabledAsync()
				if (servicesEnabled) {
					// await checkNotificationPermission() DEPRECATED notifee
					return allPermissionsGrantedCallback?.()
				}
			} catch (e) {
				console.log('User denied enabling GPS services', e)
			}
		}, [allPermissionsGrantedCallback, closeBottomSheet])

		// ==========================================
		// 3. GPS Enabled
		// ==========================================
		const checkIsGPSEnabled = useCallback(async () => {
			/** Шаг 3, проверка включен ли GPS на устройстве */
			const isGPSEnabled = await Location.hasServicesEnabledAsync() // ios + android

			if (!isGPSEnabled) {
				if (Platform.OS === 'ios') {
					return showIOSLocationServicesAlert()
				}

				return openBottomSheet(<EnableGPS allow={allowGPS} close={closeBottomSheet} />)
			} else {
				// return checkNotificationPermission() DEPRECATED notifee
				return allPermissionsGrantedCallback?.()
			}
		}, [allPermissionsGrantedCallback, allowGPS, closeBottomSheet, openBottomSheet, showIOSLocationServicesAlert])

		const allowBackgroundLocationPermission = useCallback(async () => {
			const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync() // ios + android
			await closeBottomSheet()

			if (backgroundStatus === 'granted') {
				return checkIsGPSEnabled()
			} else {
				return
			}
		}, [checkIsGPSEnabled, closeBottomSheet])

		// ==========================================
		// 2. Background Location
		// ==========================================
		const checkBackgroundPermission = useCallback(async () => {
			/** Шаг 2, проверка разрешения на предоставление геолокации в фоновом режиме */
			const { granted, canAskAgain } = await Location.getBackgroundPermissionsAsync() // ios + android
			const isIOSLocationServicesAlertShown = await checkIOSLocationServicesAndShowAlert(granted, canAskAgain)
			if (isIOSLocationServicesAlertShown) return

			if (granted) {
				return checkIsGPSEnabled()
			} else if (!granted && canAskAgain) {
				return openBottomSheet(
					<AllowBackgroundGeolocation allow={allowBackgroundLocationPermission} close={closeBottomSheet} />
				)
			} else if (!granted && !canAskAgain) {
				return openBottomSheet(
					<AllowDeniedGeolocation allow={() => openAppSettings()} close={closeBottomSheet} />
				)
			}
		}, [
			allowBackgroundLocationPermission,
			checkIOSLocationServicesAndShowAlert,
			checkIsGPSEnabled,
			closeBottomSheet,
			openAppSettings,
			openBottomSheet
		])

		const allowForegroundLocationPermission = useCallback(async () => {
			const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync() // ios + android
			await closeBottomSheet()

			if (foregroundStatus === 'granted') {
				await checkBackgroundPermission()
			} else {
				return
			}
		}, [checkBackgroundPermission, closeBottomSheet])

		// ==========================================
		// 1. Foreground Location
		// ==========================================
		const checkForegroundPermission = useCallback(async () => {
			/** Шаг 1, проверка разрешения на предоставление геолокации в активном режиме */
			const { granted, canAskAgain } = await Location.getForegroundPermissionsAsync() // ios + android
			const isIOSLocationServicesAlertShown = await checkIOSLocationServicesAndShowAlert(granted, canAskAgain)
			if (isIOSLocationServicesAlertShown) return

			if (granted) {
				return checkBackgroundPermission()
			} else if (!granted && canAskAgain) {
				return openBottomSheet(
					<AllowGeolocation allow={allowForegroundLocationPermission} close={closeBottomSheet} />
				)
			} else if (!granted && !canAskAgain) {
				return openBottomSheet(
					<AllowDeniedGeolocation allow={() => openAppSettings()} close={closeBottomSheet} />
				)
			}
		}, [
			allowForegroundLocationPermission,
			checkBackgroundPermission,
			checkIOSLocationServicesAndShowAlert,
			closeBottomSheet,
			openAppSettings,
			openBottomSheet
		])

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
		}, [checkForegroundPermission]) // appState

		// ==========================================
		// 4. Notifications (Android only) DEPRECATED notifee
		// ==========================================
		// const checkNotificationPermission = async () => {
		// 	/** Шаг 4, проверка включены ли уведомления (имеет смысл только на android, т.к. для ios не используется foreground сервис уведомлений) */
		// 	if (Platform.OS === 'android') {
		// 		const { granted, canAskAgain } = await Notification.getPermissionsAsync()
		//
		// 		if (granted) {
		// 			return checkPhysicalActivityTrackPermission()
		// 		} else if (!granted && canAskAgain) {
		// 			return openBottomSheet(
		// 				<AllowNotifications allow={allowNotificationPermission} close={closeBottomSheet} />
		// 			)
		// 		} else if (!granted && !canAskAgain) {
		// 			return openBottomSheet(
		// 				<AllowDeniedNotifications allow={() => openAppSettings(true)} close={closeBottomSheet} />
		// 			)
		// 		}
		// 	} else {
		// 		// for ios
		// 		return checkPhysicalActivityTrackPermission()
		// 	}
		// }

		// const allowNotificationPermission = async () => {
		// 	const { status } = await Notification.requestPermissionsAsync()
		// 	closeBottomSheet()
		// 	if (status === 'granted') {
		// 		return checkPhysicalActivityTrackPermission()
		// 	} else {
		// 		return
		// 	}
		// }

		// ==========================================
		// 5. Physical Activity (Android only) DEPRECATED notifee
		// ==========================================
		// const checkPhysicalActivityTrackPermission = async () => {
		// 	/** Шаг 5, проверка включен ли трек физ. активности (имеет смысл только на android) */
		// 	if (Platform.OS === 'android') {
		// 		const isGranted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION) // 2
		//
		// 		if (isGranted) {
		// 			return allPermissionsGrantedCallback?.()
		// 		} else {
		// 			return openBottomSheet(
		// 				<AllowTrackPhysicalActivity allow={allowPhysicalActivityPermission} close={closeBottomSheet} />
		// 			)
		// 		}
		// 	} else {
		// 		return allPermissionsGrantedCallback?.()
		// 	}
		// }

		// const allowPhysicalActivityPermission = async () => {
		// 	closeBottomSheet()
		//
		// 	try {
		// 		const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION)
		// 		if (result === PermissionsAndroid.RESULTS.GRANTED) {
		// 			return allPermissionsGrantedCallback?.()
		// 		} else if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
		// 			return openAppSettings()
		// 		} else if (result === PermissionsAndroid.RESULTS.DENIED) {
		// 			return
		// 		}
		// 	} catch (e) {
		// 		console.warn(e)
		// 	}
		// }

		useImperativeHandle(
			ref,
			() => ({
				checkPermissions: checkForegroundPermission
			}),
			[checkForegroundPermission]
		)

		return (
			<BottomSheet ref={bottomSheetRef} blurDisabled={Platform.OS === 'android'}>
				{bottomSheetContent}
			</BottomSheet>
		)
	}
)

AllGeolocationPermissions.displayName = 'AllGeolocationPermissions'

export default AllGeolocationPermissions
