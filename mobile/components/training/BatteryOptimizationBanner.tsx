import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AppState, Linking, Platform, Pressable, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import CloseSvg from '@/components/svg/CloseSvg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useFocusEffect } from 'expo-router'
import * as Battery from 'expo-battery'
import * as IntentLauncher from 'expo-intent-launcher'
import * as Application from 'expo-application'
import { isBatteryOptimizationSnoozed, setBatteryOptimizationDismissedAt } from '@/store/batteryStorage'

/**
 * Показывается только если Battery.isBatteryOptimizationEnabledAsync() === true (Android only)
 * и баннер не находится в snooze-периоде после последнего закрытия крестиком (см. batteryStorage.ts).
 */
const BatteryOptimizationBanner = () => {
	const insets = useSafeAreaInsets()
	const appId = Application.applicationId
	const isAndroid = Platform.OS === 'android'

	const [isVisible, setIsVisible] = useState(false)

	const wasInSettingsRef = useRef(false)
	const appStateRef = useRef(AppState.currentState)

	const checkStatus = useCallback(async () => {
		if (!isAndroid) {
			setIsVisible(false)
			return
		}

		try {
			const isEnabled = await Battery.isBatteryOptimizationEnabledAsync()

			if (!isEnabled) {
				setIsVisible(false)
				return
			}

			// Оптимизация всё ещё включена — смотрим, не закрывали ли баннер недавно
			setIsVisible(!isBatteryOptimizationSnoozed())
		} catch (error) {
			console.warn('Failed to check battery optimization status', error)
			setIsVisible(false)
		}
	}, [isAndroid])

	useFocusEffect(
		useCallback(() => {
			checkStatus()
		}, [checkStatus])
	)

	// Проверяем статус при возврате из системных настроек (свернули → развернули приложение)
	useEffect(() => {
		if (!isAndroid) return

		const subscription = AppState.addEventListener('change', (nextAppState) => {
			if (
				wasInSettingsRef.current &&
				appStateRef.current.match(/inactive|background/) &&
				nextAppState === 'active'
			) {
				wasInSettingsRef.current = false
				setTimeout(checkStatus, 500)
			}

			appStateRef.current = nextAppState
		})

		return () => subscription.remove()
	}, [checkStatus, isAndroid])

	const requestDisableBatteryOptimization = useCallback(async () => {
		wasInSettingsRef.current = true

		// Шаг 1: системный диалог для конкретного приложения
		try {
			await IntentLauncher.startActivityAsync(
				IntentLauncher.ActivityAction.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS,
				{
					data: `package:${appId}`
				}
			)
			return
		} catch (error) {
			console.warn('REQUEST_IGNORE_BATTERY_OPTIMIZATIONS failed, falling back to app settings', error)
		}

		// Шаг 2: гарантированно видимый список приложений "Оптимизация работы батареи"
		// (публичный AOSP-экран, не требует спец. разрешений).
		try {
			await IntentLauncher.startActivityAsync(IntentLauncher.ActivityAction.IGNORE_BATTERY_OPTIMIZATION_SETTINGS)
			return
		} catch (error) {
			console.warn('IGNORE_BATTERY_OPTIMIZATION_SETTINGS failed, trying request dialog', error)
		}

		// Шаг 3: крайний фолбэк — общий экран "О приложении".
		try {
			await Linking.openSettings()
		} catch (settingsError) {
			console.error('Error opening settings:', settingsError)
			wasInSettingsRef.current = false
		}
	}, [appId])

	const dismiss = useCallback(() => {
		setBatteryOptimizationDismissedAt()
		setIsVisible(false)
	}, [])

	if (!isVisible) return null

	return (
		<View
			style={{
				top: insets.top + 40,
				zIndex: 1,
				elevation: 1
			}}
			pointerEvents="box-none"
			className="-translate-x-[50%] left-[50%] absolute flex-row justify-around items-center w-full"
		>
			<View className="mx-[16px] mt-[12px] flex-row items-start justify-between rounded-[16px] bg-black/80 p-[14px] gap-[10px]">
				<Text style={{ fontFamily: fontFamily.regular }} className="flex-1 text-white text-sm leading-[19px]">
					Отключите{' '}
					<Text
						onPress={requestDisableBatteryOptimization}
						style={{ fontFamily: fontFamily.bold }}
						className="text-green-main underline"
					>
						оптимизацию батареи
					</Text>{' '}
					для правильной работы геолокации
				</Text>
				<Pressable onPress={dismiss} hitSlop={10} className="pt-[2px]">
					<CloseSvg />
				</Pressable>
			</View>
		</View>
	)
}

export default BatteryOptimizationBanner
