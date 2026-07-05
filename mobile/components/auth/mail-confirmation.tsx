import React, { useCallback, useMemo, useState } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { View, Text, Keyboard, Pressable } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { OTPInput } from '@/components/ui/OTP/OTPInput'
import { Page } from '@/components/ui/Page'
import { EMAIL_CONFIRMATION_CODE_SIZE } from '@/shared/constants'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { requestConfirmEmailCode } from '@/api/auth'
import { useConfirmEmailMutation } from '@/queries/my-profile'
import { FieldErrors, getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useTimerCountdown } from '@/hooks/useTimerCountdown'
import { createTimer, TimerType } from '@/store/timerStorage'
import { formatCountdown } from '@/helpers/formatTime'
import ErrorMessageIcon from '@/components/ErrorMessageIcon'
import CheckSpam from '@/components/CheckSpam'
import { useKeyboardAnimation } from '@/hooks/useKeyboardAnimation'
import Animated from 'react-native-reanimated'
import { KeyboardGestureArea } from 'react-native-keyboard-controller'
import * as Haptics from 'expo-haptics'
import { useAuthStore } from '@/store/authStore'

interface IProps {
	email: string
	handlePressBack: () => void
}

const MailConfirmation = ({ email, handlePressBack }: IProps) => {
	const { login } = useAuthStore()
	const { push } = useSafeNavigation()
	const { mutateAsync: confirmEmailMutation, isPending } = useConfirmEmailMutation()
	const { remainingSeconds, isBlocked, refresh } = useTimerCountdown(TimerType.EMAIL_CONFIRMATION, email)
	const { animatedKeyboardStyle } = useKeyboardAnimation()

	const [errors, setErrors] = useState<FieldErrors>({} as FieldErrors)

	const onDone = useCallback(
		async (code: string) => {
			try {
				const regData = await confirmEmailMutation({ email, code })
				const { token, ...restParameters } = regData
				await login(regData.token, restParameters)
				push('/(tabs)/profile')
			} catch (e) {
				const formattedErrors = await getFieldsErrors(e)
				setErrors(formattedErrors)
				await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
			}
		},
		[email, confirmEmailMutation, login, push]
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
			const requestCodeResult = await requestConfirmEmailCode(email)
			createTimer(TimerType.EMAIL_CONFIRMATION, email, requestCodeResult.waitMs)
			refresh()
		} catch (e) {
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
				<Container className="flex-1">
					<Pressable onPress={Keyboard.dismiss} className="flex-1">
						<View className="flex-1">
							<HeaderBack returnCallback={handlePressBack}>Назад</HeaderBack>
							<Animated.View style={animatedKeyboardStyle} className="flex-1 justify-center gap-[24px]">
								<View className="gap-[32px]">
									<View className="gap-[8px]">
										<Text className="text-2xl text-white" style={{ fontFamily: fontFamily.medium }}>
											Подтверждение почты
										</Text>
										<Text
											className="text-base text-gray-9a"
											style={{ fontFamily: fontFamily.medium }}
										>
											Мы отправили код на {email}
										</Text>
									</View>
									<View className="gap-[12px]">
										<Text className="text-lg text-white" style={{ fontFamily: fontFamily.medium }}>
											Введите код
										</Text>
										<OTPInput
											hasError={hasError}
											length={EMAIL_CONFIRMATION_CODE_SIZE}
											onDone={onDone}
											clearError={handleClearOTPError}
										/>
									</View>
								</View>
								<View className="gap-[24px]">
									{hasError && <ErrorMessageIcon errorText={errors.code} />}
									<Button
										variant="black"
										isLoading={isPending}
										disabled={isBlocked || isPending}
										onPress={handleResendOTP}
									>
										{isBlocked
											? `Отправить код повторно (${formattedTime})`
											: 'Отправить код повторно'}
									</Button>
									<CheckSpam />
								</View>
							</Animated.View>
						</View>
					</Pressable>
				</Container>
			</KeyboardGestureArea>
		</Page>
	)
}

export default MailConfirmation
