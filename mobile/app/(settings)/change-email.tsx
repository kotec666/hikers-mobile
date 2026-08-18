import React, { useCallback, useMemo, useState } from 'react'
import { Keyboard, Pressable, Text, View } from 'react-native'
import { Controller, useForm } from 'react-hook-form'
import { useRouter } from 'expo-router'
import Animated from 'react-native-reanimated'
import { KeyboardGestureArea } from 'react-native-keyboard-controller'
import { useTranslation } from 'react-i18next'
import * as Haptics from 'expo-haptics'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { OTPInput } from '@/components/ui/OTP/OTPInput'
import ErrorMessageIcon from '@/components/ErrorMessageIcon'
import CheckSpam from '@/components/CheckSpam'
import { Page } from '@/components/ui/Page'
import { fontFamily } from '@/constants/Fonts'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { FieldErrors, getFieldsErrors } from '@/helpers/getFieldsErrors'
import { lengths } from '@shared/lengths'
import { EMAIL_CONFIRMATION_CODE_SIZE } from '@/shared/constants'
import { useConfirmEmailChangeMutation, useProfileQuery, useRequestEmailChangeMutation } from '@/queries/my-profile'
import { useAuthStore } from '@/store/authStore'
import { useToast } from '@/hooks/useToast'
import { createTimer, isRateLimited, TimerType } from '@/store/timerStorage'
import { useTimerCountdown } from '@/hooks/useTimerCountdown'
import { formatCountdown } from '@/helpers/formatTime'
import { useKeyboardAnimation } from '@/hooks/useKeyboardAnimation'

interface IChangeEmailFormState {
	newEmail: string
	password: string
}

const ChangeEmailPage = () => {
	const { t } = useTranslation()
	const router = useRouter()
	const { user, setUser } = useAuthStore()
	const toast = useToast()
	const { data: profileData } = useProfileQuery()
	const { mutateAsync: requestCode, isPending: isRequesting } = useRequestEmailChangeMutation()
	const { mutateAsync: confirmCode, isPending: isConfirming } = useConfirmEmailChangeMutation()
	const { ErrorMessages } = useErrorMessage()
	const { animatedKeyboardStyle } = useKeyboardAnimation()

	const [step, setStep] = useState<'form' | 'code'>('form')
	const [submitted, setSubmitted] = useState<IChangeEmailFormState | null>(null)
	const [errors, setErrors] = useState<FieldErrors>({} as FieldErrors)

	const currentEmail = profileData?.user?.email

	const {
		handleSubmit,
		control,
		formState: { isSubmitting }
	} = useForm<IChangeEmailFormState>()

	const codeEmail = submitted?.newEmail ?? ''
	const { remainingSeconds, isBlocked, refresh } = useTimerCountdown(TimerType.EMAIL_CHANGE, codeEmail)

	const hasError = useMemo(() => Boolean(Object.keys(errors).length), [errors])
	const formattedTime = formatCountdown(remainingSeconds * 1000)

	const onSubmit = async (formState: IChangeEmailFormState) => {
		setErrors({})

		try {
			const isLimited = isRateLimited(TimerType.EMAIL_CHANGE, formState.newEmail)

			// если таймер уже существует — НЕ шлём новый код
			if (!isLimited) {
				const result = await requestCode({ newEmail: formState.newEmail, password: formState.password })
				createTimer(TimerType.EMAIL_CHANGE, formState.newEmail, result.waitMs)
			}

			setSubmitted(formState)
			setStep('code')
		} catch (e: unknown) {
			const formattedErrors = await getFieldsErrors(e, t)
			setErrors(formattedErrors)
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
		}
	}

	const onDone = useCallback(
		async (code: string) => {
			try {
				const result = await confirmCode(code)
				if (user) {
					setUser({ ...user, email: result.email, isEmailConfirmed: result.isEmailConfirmed })
				}
				toast.success(t('common.savedSuccess'))
				router.back()
			} catch (e: unknown) {
				const formattedErrors = await getFieldsErrors(e, t)
				setErrors(formattedErrors)
				await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
			}
		},
		[confirmCode, user, setUser, toast, t, router]
	)

	const handleClearOTPError = () => {
		setErrors({})
	}

	const handleResendOTP = async () => {
		if (!submitted || isBlocked) return

		handleClearOTPError()

		try {
			const result = await requestCode({ newEmail: submitted.newEmail, password: submitted.password })
			createTimer(TimerType.EMAIL_CHANGE, submitted.newEmail, result.waitMs)
			refresh()
		} catch (e: unknown) {
			const formattedErrors = await getFieldsErrors(e, t)
			setErrors(formattedErrors)
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
		}
	}

	const handleBack = () => {
		if (step === 'code') {
			setStep('form')
			return
		}
		router.back()
	}

	return (
		<Page>
			<KeyboardGestureArea enableSwipeToDismiss showOnSwipeUp interpolator="linear" style={{ flex: 1 }}>
				<Pressable onPress={Keyboard.dismiss} className="flex-1">
					<Container className="flex-1">
						<View className="flex-1">
							<HeaderBack returnCallback={handleBack}>{t('common.back')}</HeaderBack>
							{step === 'form' ? (
								<Animated.View
									style={animatedKeyboardStyle}
									className="flex-1 justify-center gap-[24px]"
								>
									<View className="gap-[32px]">
										<View className="gap-[8px]">
											<Text
												className="text-2xl text-white"
												style={{ fontFamily: fontFamily.medium }}
											>
												{t('ChangeEmailPage.header')}
											</Text>
											<Text
												className="text-base text-gray-9a"
												style={{ fontFamily: fontFamily.medium }}
											>
												{t('ChangeEmailPage.willSendToNewEmail')}
											</Text>
										</View>
										<View className="gap-[12px]">
											{currentEmail ? (
												<View className="gap-[4px]">
													<Text
														className="text-gray-ab text-sm"
														style={{ fontFamily: fontFamily.medium }}
													>
														{t('ChangeEmailPage.currentEmail')}
													</Text>
													<Text
														className="text-white"
														style={{ fontFamily: fontFamily.medium }}
													>
														{currentEmail}
													</Text>
												</View>
											) : null}
											<Controller
												name="newEmail"
												control={control}
												rules={{
													required: {
														value: true,
														message: ErrorMessages.required
													},
													pattern: {
														value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,
														message: ErrorMessages.email
													},
													minLength: {
														value: lengths.user.email.min,
														message: ErrorMessages.optionalMin(lengths.user.email.min)
													},
													maxLength: {
														value: lengths.user.email.max,
														message: ErrorMessages.optionalMax(lengths.user.email.max)
													}
												}}
												render={({
													field: { onChange, onBlur, value },
													fieldState: { error }
												}) => (
													<Input
														textContentType="emailAddress"
														keyboardType="email-address"
														placeholder={t('ChangeEmailPage.newEmailPlaceholder')}
														error={error?.message || errors?.newEmail}
														autoCapitalize="none"
														onChangeText={(text) => onChange(text.replace(/\s/g, ''))}
														value={value}
														onBlur={onBlur}
													/>
												)}
											/>
											<Controller
												name="password"
												control={control}
												rules={{
													required: {
														value: true,
														message: ErrorMessages.required
													},
													minLength: {
														value: lengths.user.password.min,
														message: ErrorMessages.optionalMin(lengths.user.password.min)
													},
													maxLength: {
														value: lengths.user.password.max,
														message: ErrorMessages.optionalMax(lengths.user.password.max)
													}
												}}
												render={({
													field: { onChange, onBlur, value },
													fieldState: { error }
												}) => (
													<Input
														textContentType="password"
														secureTextEntry
														placeholder={t('ChangeEmailPage.currentPasswordPlaceholder')}
														error={error?.message || errors?.password}
														autoCapitalize="none"
														onChangeText={onChange}
														value={value}
														onBlur={onBlur}
													/>
												)}
											/>
										</View>
									</View>
									<Button
										variant="black"
										isLoading={isSubmitting || isRequesting}
										onPress={handleSubmit(onSubmit)}
									>
										{t('ChangeEmailPage.sendCode')}
									</Button>
								</Animated.View>
							) : (
								<Animated.View
									style={animatedKeyboardStyle}
									className="flex-1 justify-center gap-[24px]"
								>
									<View className="gap-[32px]">
										<View className="gap-[8px]">
											<Text
												className="text-2xl text-white"
												style={{ fontFamily: fontFamily.medium }}
											>
												{t('ChangeEmailPage.header')}
											</Text>
											<Text
												className="text-base text-gray-9a"
												style={{ fontFamily: fontFamily.medium }}
											>
												{t('ChangeEmailPage.codeSent')} {codeEmail}
											</Text>
										</View>
										<View className="gap-[12px]">
											<Text
												className="text-lg text-white"
												style={{ fontFamily: fontFamily.medium }}
											>
												{t('ChangeEmailPage.enterCode')}
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
											isLoading={isConfirming}
											disabled={isBlocked}
											onPress={handleResendOTP}
										>
											{isBlocked
												? `${t('ChangeEmailPage.resendCode')} (${formattedTime})`
												: t('ChangeEmailPage.resendCode')}
										</Button>
										<CheckSpam />
									</View>
								</Animated.View>
							)}
						</View>
					</Container>
				</Pressable>
			</KeyboardGestureArea>
		</Page>
	)
}

export default ChangeEmailPage
