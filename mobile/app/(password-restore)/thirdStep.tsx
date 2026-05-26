import React, { useCallback, useState } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { View, Text, Keyboard, Pressable } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { InputIcon } from '@/components/ui/InputIcon'
import PasswordSvg from '@/components/svg/PasswordSvg'
import { Page } from '@/components/ui/Page'
import { FieldErrors, getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Controller, useForm } from 'react-hook-form'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import * as Haptics from 'expo-haptics'
import { recoverPassword } from '@/api/auth'
import { useToast } from '@/hooks/useToast'
import { lengths } from '@shared/lengths'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { removeTimer, TimerType } from '@/store/timerStorage'
import { KeyboardGestureArea } from 'react-native-keyboard-controller'
import Animated from 'react-native-reanimated'
import { useKeyboardAnimation } from '@/hooks/useKeyboardAnimation'

interface IRecoveryPasswordThirdStepFormState {
	password: string
	confirmPassword: string
}

const ThirdStepPage = () => {
	const { push, replace } = useSafeNavigation()
	const toast = useToast()
	const { email, code } = useLocalSearchParams<{
		email?: string
		code?: string
	}>()

	const [serverErrors, setServerErrors] = useState<FieldErrors>({} as FieldErrors)

	const { animatedKeyboardStyle } = useKeyboardAnimation()

	useFocusEffect(
		useCallback(() => {
			if (!email || !code) {
				replace('/(password-restore)/firstStep')
			}
		}, [email, code, replace])
	)

	const {
		handleSubmit,
		control,
		watch,
		formState: { isSubmitting }
	} = useForm<IRecoveryPasswordThirdStepFormState>()
	const { ErrorMessages } = useErrorMessage()

	const onSubmit = async (thirdRecoveryStepFormState: IRecoveryPasswordThirdStepFormState) => {
		setServerErrors({})
		try {
			if (!code || !email) return push('/(password-restore)/firstStep')
			await recoverPassword(
				code,
				email,
				thirdRecoveryStepFormState.password,
				thirdRecoveryStepFormState.confirmPassword
			)

			if (email) {
				removeTimer(TimerType.PASSWORD_RECOVERY, email)
			}

			push('/')
			toast.success('Пароль успешно изменён')
		} catch (e: unknown) {
			const formattedErrors = await getFieldsErrors(e)
			setServerErrors(formattedErrors)
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
		}
	}

	if (!email || !code) return null
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
											Восстановление пароля
										</Text>
										<Text
											className="text-base text-gray-9a"
											style={{ fontFamily: fontFamily.medium }}
										>
											Придумайте новый пароль
										</Text>
									</View>
									<View className="gap-[8px]">
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
											render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
												<InputIcon
													isPassword
													autoCapitalize="none"
													placeholder="Введите пароль"
													textContentType="password"
													keyboardType="numbers-and-punctuation"
													svg={
														<PasswordSvg
															error={Boolean(
																error?.message?.length || serverErrors?.password
															)}
														/>
													}
													error={error?.message || serverErrors?.password}
													onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
													value={value}
													onBlur={onBlur}
												/>
											)}
										/>
										<Controller
											name="confirmPassword"
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
												},
												validate: (val: string) => {
													if (watch('password') !== val) {
														return ErrorMessages.passwordsNotEquals
													}
												}
											}}
											render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
												<InputIcon
													isPassword
													autoCapitalize="none"
													placeholder="Повтор пароля"
													textContentType="password"
													keyboardType="numbers-and-punctuation"
													svg={
														<PasswordSvg
															error={Boolean(
																error?.message?.length || serverErrors.confirmPassword
															)}
														/>
													}
													error={error?.message || serverErrors?.confirmPassword}
													onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
													value={value}
													onBlur={onBlur}
												/>
											)}
										/>
									</View>
								</View>
								<Button variant="black" isLoading={isSubmitting} onPress={handleSubmit(onSubmit)}>
									Сохранить новый пароль
								</Button>
							</Animated.View>
						</View>
					</Container>
				</Pressable>
			</KeyboardGestureArea>
		</Page>
	)
}

export default ThirdStepPage
