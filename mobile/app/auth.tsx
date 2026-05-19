import {
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TouchableWithoutFeedback,
	View
} from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { InputIcon } from '@/components/ui/InputIcon'
import EmailSvg from '@/components/svg/EmailSvg'
import PasswordSvg from '@/components/svg/PasswordSvg'
import { useState } from 'react'
import Checkbox from '@/components/ui/Checkbox'
import { LinkCustom } from '@/components/ui/LinkCustom'
import { useAuthStore } from '@/store/authStore'
import { useLocalSearchParams } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { FieldErrors, getFieldsErrors } from '@/helpers/getFieldsErrors'
import { loginUser, registrationUser, requestConfirmEmailCode } from '@/api/auth'
import { cn } from '@/helpers/cn'
import { lengths } from '@shared/lengths'
import * as Haptics from 'expo-haptics'
import { Page } from '@/components/ui/Page'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { createTimer, TimerType } from '@/store/timerStorage'

export enum AUTH_MODE {
	AUTH = 'auth',
	REGISTRATION = 'registration'
}

interface IAuthFormState {
	email: string
	password: string
	agree: boolean
}

const AuthPage = () => {
	const { mode } = useLocalSearchParams<{ mode: AUTH_MODE }>()
	const { push } = useSafeNavigation()
	const {
		handleSubmit,
		control,
		formState: { errors }
	} = useForm<IAuthFormState>()
	const { ErrorMessages } = useErrorMessage()

	const [data, setData] = useState<{
		mode: AUTH_MODE
		notificationText?: string | boolean
		isLoading: boolean
		errors?: FieldErrors
	}>({
		mode: mode || AUTH_MODE.REGISTRATION,
		notificationText: undefined,
		isLoading: false,
		errors: {} as FieldErrors
	})

	const { login } = useAuthStore()

	const handleClickRedirect = () => {
		return setData((s) => ({ ...s, mode: s.mode === AUTH_MODE.AUTH ? AUTH_MODE.REGISTRATION : AUTH_MODE.AUTH }))
	}

	const onSubmit = async (authFormState: IAuthFormState) => {
		setData((s) => ({ ...s, isLoading: true, errors: undefined }))

		if (data.mode === AUTH_MODE.AUTH) {
			try {
				const loginData = await loginUser({ email: authFormState.email, password: authFormState.password })
				const { token, ...restParameters } = loginData

				await login(loginData.token, restParameters)
			} catch (e: unknown) {
				const formattedErrors = await getFieldsErrors(e)
				setData((s) => ({ ...s, errors: formattedErrors }))
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
				// Alert.alert('Ошибка', 'Неверные учетные данные')
			} finally {
				setData((s) => ({ ...s, isLoading: false }))
			}
		}

		if (data.mode === AUTH_MODE.REGISTRATION) {
			try {
				const regData = await registrationUser({
					email: authFormState.email,
					password: authFormState.password,
					isTermsAccepted: authFormState.agree
				})
				const { token, ...restParameters } = regData

				await login(regData.token, restParameters)
				// запрос кода на подтверждение почты
				await requestConfirmEmailCode()
				createTimer(TimerType.EMAIL_CONFIRMATION, authFormState.email)
				push(`/mail-confirmation?email=${authFormState.email}`)
			} catch (e: unknown) {
				const formattedErrors = await getFieldsErrors(e)
				setData((s) => ({ ...s, errors: formattedErrors }))
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
				// Alert.alert('Ошибка', 'Неверные учетные данные')
			} finally {
				setData((s) => ({ ...s, isLoading: false }))
			}
		}
	}

	return (
		<Page>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
				<Container className="flex-1 mb-[10px]">
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View className="flex-grow">
							<Text className="text-white text-xl" style={{ fontFamily: fontFamily.bold }}>
								{data.mode === AUTH_MODE.AUTH ? 'Авторизация' : 'Регистрация'}
							</Text>
							<View className="gap-[10px] mt-[65px]">
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
											error={error?.message || data.errors?.email}
											svg={
												<EmailSvg
													error={Boolean(error?.message?.length || data.errors?.email)}
												/>
											}
											autoCapitalize="none"
											onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
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
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<InputIcon
											isPassword
											autoCapitalize="none"
											placeholder="Введите пароль"
											textContentType="password"
											keyboardType="numbers-and-punctuation"
											svg={
												<PasswordSvg
													error={Boolean(error?.message?.length || data.errors?.password)}
												/>
											}
											error={error?.message || data.errors?.password}
											onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
											value={value}
											onBlur={onBlur}
										/>
									)}
								/>

								{data.mode === AUTH_MODE.AUTH && (
									<LinkCustom
										href="/(password-restore)/firstStep"
										text="Забыли пароль?"
										className="text-blue-3d"
									/>
								)}
							</View>
						</View>
					</TouchableWithoutFeedback>
					{data.mode !== AUTH_MODE.AUTH && (
						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							<View className="flex-row gap-[10px]">
								<View className="pt-[3px]">
									<Controller
										name="agree"
										control={control}
										rules={{
											required: {
												value: true,
												message: ErrorMessages.required
											}
										}}
										render={({ field: { onChange, value }, fieldState: { error } }) => (
											<Checkbox value={value} error={Boolean(error)} onValueChange={onChange} />
										)}
									/>
								</View>
								<Text
									className={cn('flex-shrink mb-[37px] text-[11px]', {
										'text-gray-ab': !errors.agree?.message,
										'text-red-500': errors.agree?.message
									})}
									style={{ fontFamily: fontFamily.regular }}
								>
									Согласен с{' '}
									<LinkCustom
										href="/document"
										text="условиями обработки"
										className={cn('', {
											'text-blue-3d': !errors.agree?.message,
											'text-red-500': errors.agree?.message
										})}
									/>{' '}
									персональных данных и{' '}
									<LinkCustom
										href="/document"
										text="политикой конфиденциальности"
										className={cn('', {
											'text-blue-3d': !errors.agree?.message,
											'text-red-500': errors.agree?.message
										})}
									/>
								</Text>
							</View>
						</TouchableWithoutFeedback>
					)}
					<Button variant="white" onPress={handleSubmit(onSubmit)} isLoading={data.isLoading}>
						{data.mode === AUTH_MODE.AUTH ? 'Войти' : 'Зарегистрироваться'}
					</Button>
				</Container>
			</KeyboardAvoidingView>
			<Container className="pb-[40px]">
				<Button variant="white" onPress={handleClickRedirect}>
					{data.mode === AUTH_MODE.AUTH ? 'Зарегистрироваться' : 'Войти'}
				</Button>
			</Container>
		</Page>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
})

export default AuthPage
