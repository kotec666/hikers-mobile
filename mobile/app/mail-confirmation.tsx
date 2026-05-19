import React, { useCallback, useMemo, useState } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { View, Text, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import AlertCircleSvg from '@/components/svg/AlertCircleSvg'
import MailboxSvg from '@/components/svg/MailboxSvg'
import { OTPInput } from '@/components/ui/OTP/OTPInput'
import * as Haptics from 'expo-haptics'
import { Page } from '@/components/ui/Page'
import { EMAIL_CONFIRMATION_CODE_SIZE } from '@/shared/constants'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useLocalSearchParams, useFocusEffect } from 'expo-router'
import { requestConfirmEmailCode } from '@/api/auth'
import { useConfirmEmailMutation } from '@/queries/my-profile'
import { FieldErrors, getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useTimerCountdown } from '@/hooks/useTimerCountdown'
import { createTimer, TimerType } from '@/store/timerStorage'
import { formatCountdown } from '@/helpers/formatTime'

const MailConfirmation = () => {
	const { push, replace } = useSafeNavigation()
	const { email } = useLocalSearchParams<{ email?: string }>()
	const { mutateAsync: confirmEmailMutation, isPending } = useConfirmEmailMutation()
	const { remainingSeconds, isBlocked } = useTimerCountdown(TimerType.EMAIL_CONFIRMATION, email)

	const [errors, setErrors] = useState<FieldErrors>({} as FieldErrors)

	useFocusEffect(
		useCallback(() => {
			if (!email) {
				replace('/(tabs)/profile')
			}
		}, [email, replace])
	)

	const onDone = useCallback(
		async (code: string) => {
			try {
				await confirmEmailMutation(code)
				push('/(tabs)/profile')
			} catch (e) {
				const formattedErrors = await getFieldsErrors(e)
				setErrors(formattedErrors)
				await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
			}
		},
		[confirmEmailMutation, push]
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

		await requestConfirmEmailCode()

		createTimer(TimerType.EMAIL_CONFIRMATION, email)
	}

	const hasError = useMemo(() => {
		return Boolean(Object.keys(errors).length)
	}, [errors])

	const formattedTime = formatCountdown(remainingSeconds * 1000)

	if (!email) return null
	return (
		<Page>
			<Container className="flex-1">
				<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
						<View className="flex-1">
							<HeaderBack returnCallback={() => push('/(tabs)/profile')}>Назад</HeaderBack>
							<View className="flex-1 justify-center gap-[24px]">
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
									{hasError && (
										<View className="flex-row items-center gap-[8px]">
											<AlertCircleSvg />
											<Text
												className="text-base text-red-ff4"
												style={{ fontFamily: fontFamily.medium }}
											>
												{errors.code}
											</Text>
										</View>
									)}
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
									<View className="flex-row justify-center items-center gap-[8px]">
										<MailboxSvg />
										<Text
											className="text-base text-gray-9a"
											style={{ fontFamily: fontFamily.medium }}
										>
											Не получили код? Проверьте спам
										</Text>
									</View>
								</View>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Container>
		</Page>
	)
}

export default MailConfirmation
