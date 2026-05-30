import React, { useState } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { View, Text, Pressable, Keyboard } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { InputIcon } from '@/components/ui/InputIcon'
import EmailSvg from '@/components/svg/EmailSvg'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Page } from '@/components/ui/Page'
import { Controller, useForm } from 'react-hook-form'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { FieldErrors, getFieldsErrors } from '@/helpers/getFieldsErrors'
import * as Haptics from 'expo-haptics'
import { lengths } from '@shared/lengths'
import { requestPasswordRecoveryCode } from '@/api/auth'
import { createTimer, isRateLimited, TimerType } from '@/store/timerStorage'
import { KeyboardGestureArea } from 'react-native-keyboard-controller'
import Animated from 'react-native-reanimated'
import { useKeyboardAnimation } from '@/hooks/useKeyboardAnimation'

interface IRecoveryPasswordFirstStepFormState {
	email: string
}

const FirstStepPage = () => {
	const { push } = useSafeNavigation()
	const [serverErrors, setServerErrors] = useState<FieldErrors>({} as FieldErrors)

	const {
		handleSubmit,
		control,
		formState: { isSubmitting }
	} = useForm<IRecoveryPasswordFirstStepFormState>()
	const { ErrorMessages } = useErrorMessage()

	// const params = {
	// 	offset: {
	// 		closed: 0,
	// 		opened: -225
	// 	}
	// }

	const { animatedKeyboardStyle } = useKeyboardAnimation() // params

	const onSubmit = async (firstRecoveryStepFormState: IRecoveryPasswordFirstStepFormState) => {
		setServerErrors({})

		const email = firstRecoveryStepFormState.email

		try {
			const isLimited = isRateLimited(TimerType.PASSWORD_RECOVERY, email)

			// если таймер уже существует —
			// НЕ шлём новый код
			if (!isLimited) {
				const requestCodeResult = await requestPasswordRecoveryCode(email)
				createTimer(TimerType.PASSWORD_RECOVERY, email, requestCodeResult.waitMs)
			}

			push(`/(password-restore)/secondStep?email=${email}`)
		} catch (e: unknown) {
			const formattedErrors = await getFieldsErrors(e)
			setServerErrors(formattedErrors)
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
		}
	}

	return (
		<Page>
			<KeyboardGestureArea enableSwipeToDismiss showOnSwipeUp interpolator="linear" style={{ flex: 1 }}>
				<Pressable onPress={Keyboard.dismiss} className="flex-1">
					<Container className="flex-1">
						<View className="flex-1 items-start">
							<HeaderBack>Назад</HeaderBack>
							<Animated.View
								style={animatedKeyboardStyle}
								// onLayout={(e) => {
								// 	console.log(e.nativeEvent.layout.height)
								// }}
								className="flex-1 justify-center gap-[24px]"
							>
								<View className="gap-[32px]">
									<View className="gap-[8px]">
										<Text className="text-2xl text-white" style={{ fontFamily: fontFamily.medium }}>
											Введите почту
										</Text>
										<Text
											className="text-base text-gray-9a"
											style={{ fontFamily: fontFamily.medium }}
										>
											Мы отправим на неё код для восстановления пароля
										</Text>
									</View>
									<Controller
										name="email"
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
										render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
											<InputIcon
												textContentType="emailAddress"
												keyboardType="email-address"
												placeholder="Введите email"
												error={error?.message || serverErrors?.email}
												svg={
													<EmailSvg
														error={Boolean(error?.message?.length || serverErrors?.email)}
													/>
												}
												autoCapitalize="none"
												onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
												value={value}
												onBlur={onBlur}
											/>
										)}
									/>
								</View>
								<Button variant="black" isLoading={isSubmitting} onPress={handleSubmit(onSubmit)}>
									Отправить код
								</Button>
							</Animated.View>
						</View>
					</Container>
				</Pressable>
			</KeyboardGestureArea>
		</Page>
	)
}

export default FirstStepPage
