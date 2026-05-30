import React, { useCallback, useMemo, useState } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { View, Text, Keyboard, Pressable } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { OTPInput } from '@/components/ui/OTP/OTPInput'
import * as Haptics from 'expo-haptics'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Page } from '@/components/ui/Page'
import { PASSWORD_RECOVERY_CODE_SIZE } from '@/shared/constants'
import { FieldErrors, getFieldsErrors } from '@/helpers/getFieldsErrors'
import { confirmPasswordRecoveryCode, requestPasswordRecoveryCode } from '@/api/auth'
import ErrorMessageIcon from '@/components/ErrorMessageIcon'
import CheckSpam from '@/components/CheckSpam'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { createTimer, TimerType } from '@/store/timerStorage'
import { useTimerCountdown } from '@/hooks/useTimerCountdown'
import { formatCountdown } from '@/helpers/formatTime'
import { KeyboardGestureArea } from 'react-native-keyboard-controller'
import { useKeyboardAnimation } from '@/hooks/useKeyboardAnimation'
import Animated from 'react-native-reanimated'

const isWrongCodeError = (
	data: any
): data is {
	remainAttempts: number | null
	success: boolean
	waitMs: number
} => {
	return data && typeof data === 'object' && 'remainAttempts' in data && 'success' in data && 'waitMs' in data
}

const SecondStepPage = () => {
	const { push, replace } = useSafeNavigation()
	const { email } = useLocalSearchParams<{
		email?: string
	}>()
	const { remainingSeconds, isBlocked } = useTimerCountdown(TimerType.PASSWORD_RECOVERY, email)

	const [errors, setErrors] = useState<FieldErrors>({} as FieldErrors)

	const { animatedKeyboardStyle } = useKeyboardAnimation()

	useFocusEffect(
		useCallback(() => {
			if (!email) {
				replace('/(password-restore)/firstStep')
			}
		}, [email, replace])
	)

	const onDone = useCallback(
		async (code: string) => {
			try {
				if (!email) return push('/(password-restore)/firstStep')

				await confirmPasswordRecoveryCode(code, email)
				push(`/(password-restore)/thirdStep?email=${email}&code=${code}`)
			} catch (e) {
				try {
					const errorData = await e.response?.json()

					// код неверный
					if (isWrongCodeError(errorData)) {
						const remainAttempts = errorData.remainAttempts

						if (errorData.waitMs > 0) {
							if (email) {
								createTimer(TimerType.PASSWORD_RECOVERY, email, errorData.waitMs)
							}

							setErrors({
								code: 'Слишком много попыток. Попробуйте позже.'
							})

							await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)

							return
						}

						const attemptsText =
							remainAttempts !== null && remainAttempts <= 3
								? `Неверный код, осталось попыток: ${remainAttempts}`
								: 'Неверный код.'

						setErrors({
							code: attemptsText
						})
						await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
						return
					}

					// все остальные ошибки
					const formattedErrors = await getFieldsErrors(errorData ?? e)
					setErrors(formattedErrors)
				} catch (parseError) {
					// если вообще не удалось распарсить response
					console.log('parseError', parseError)
					const formattedErrors = await getFieldsErrors(e)
					setErrors(formattedErrors)
				}

				await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
			}
		},
		[email, push]
	)

	const handleClearOTPError = () => {
		setErrors({})
	}

	const handleResendOTP = async () => {
		if (!email) {
			return
		}

		if (isBlocked) {
			return
		}

		handleClearOTPError()

		try {
			const requestCodeResult = await requestPasswordRecoveryCode(email)
			createTimer(TimerType.PASSWORD_RECOVERY, email, requestCodeResult.waitMs)
		} catch (e) {
			console.log('Ошибка при запросе нового кода', e)
			const formattedErrors = await getFieldsErrors(e)
			setErrors(formattedErrors)
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
		}
	}

	const hasError = useMemo(() => {
		return Boolean(Object.keys(errors).length)
	}, [errors])

	const formattedTime = formatCountdown(remainingSeconds * 1000)

	if (!email) return null
	return (
		<Page>
			<KeyboardGestureArea enableSwipeToDismiss showOnSwipeUp interpolator="linear" style={{ flex: 1 }}>
				<Pressable onPress={Keyboard.dismiss} style={{ flex: 1 }} accessible={false}>
					<Container className="flex-1">
						<View className="flex-1 items-start">
							<HeaderBack>Назад</HeaderBack>
							<Animated.View style={animatedKeyboardStyle} className="flex-1 justify-center gap-[24px]">
								<View className="gap-[32px]">
									<View className="gap-[8px]">
										<Text className="text-2xl text-white" style={{ fontFamily: fontFamily.medium }}>
											Отправили вам код
										</Text>
										<Text
											className="text-base text-gray-9a"
											style={{ fontFamily: fontFamily.medium }}
										>
											Мы отправили код для восстановления пароля на {email}
										</Text>
									</View>
									<View className="gap-[12px]">
										<Text className="text-lg text-white" style={{ fontFamily: fontFamily.medium }}>
											Введите код
										</Text>
										<OTPInput
											hasError={hasError}
											length={PASSWORD_RECOVERY_CODE_SIZE}
											onDone={onDone}
											clearError={handleClearOTPError}
										/>
									</View>
								</View>
								<View className="gap-[24px]">
									{hasError && <ErrorMessageIcon errorText={errors.code} />}
									<Button variant="black" onPress={handleResendOTP} disabled={isBlocked}>
										{isBlocked
											? `Отправить код повторно (${formattedTime})`
											: 'Отправить код повторно'}
									</Button>
									<CheckSpam />
								</View>
							</Animated.View>
						</View>
					</Container>
				</Pressable>
			</KeyboardGestureArea>
		</Page>
	)
}

export default SecondStepPage
