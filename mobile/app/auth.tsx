import { useState, useRef } from 'react'
import { Text, TextInput, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { InputIcon } from '@/components/ui/InputIcon'
import LoginSvg from '@/components/svg/LoginSvg'
import PasswordSvg from '@/components/svg/PasswordSvg'
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
import { KeyboardAwareScrollView, KeyboardStickyView } from 'react-native-keyboard-controller'
import EmailSvg from '@/components/svg/EmailSvg'
import { useKeyboardHeight } from '@/hooks/useKeyboardHeight'

export enum AUTH_MODE {
	AUTH = 'auth',
	REGISTRATION = 'registration'
}

interface IAuthFormState {
	email: string
	username: string
	password: string
	agree: boolean
}

const AuthPage = () => {
	const { login } = useAuthStore()
	const { mode } = useLocalSearchParams<{ mode: AUTH_MODE }>()
	const { push } = useSafeNavigation()
	const {
		handleSubmit,
		control,
		formState: { errors }
	} = useForm<IAuthFormState>()
	const { ErrorMessages } = useErrorMessage()
	const keyboardHeight = useKeyboardHeight()

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

	const loginRef = useRef<TextInput>(null)
	const passwordRef = useRef<TextInput>(null)

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
					username: authFormState.username,
					password: authFormState.password,
					isTermsAccepted: authFormState.agree
				})
				const { token, ...restParameters } = regData

				await login(regData.token, restParameters)
				// запрос кода на подтверждение почты
				const requestCodeResult = await requestConfirmEmailCode()
				createTimer(TimerType.EMAIL_CONFIRMATION, authFormState.email, requestCodeResult.waitMs)
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

	const isAuth = data.mode === AUTH_MODE.AUTH
	const hasSoftKeyboard = keyboardHeight > 80

	return (
		<Page style={{ paddingBottom: 20 }}>
			<View className="flex-1">
				<KeyboardAwareScrollView
					keyboardShouldPersistTaps="handled"
					contentContainerStyle={{
						flexGrow: 1
					}}
				>
					<Container className="flex-1">
						<Text className="text-white text-xl" style={{ fontFamily: fontFamily.bold }}>
							{isAuth ? 'Авторизация' : 'Регистрация'}
						</Text>
						<View
							className="gap-[10px]"
							style={{
								paddingTop: 35
							}}
						>
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
										autoComplete="email"
										importantForAutofill="yes"
										error={error?.message || data.errors?.email}
										svg={<EmailSvg error={Boolean(error?.message?.length || data.errors?.email)} />}
										autoCapitalize="none"
										onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
										value={value}
										onBlur={onBlur}
										returnKeyType="next"
										returnKeyLabel="Далее"
										submitBehavior="submit"
										onSubmitEditing={() => {
											if (isAuth) {
												return passwordRef.current?.focus()
											} else {
												return loginRef.current?.focus()
											}
										}}
									/>
								)}
							/>

							{!isAuth && (
								<Controller
									name="username"
									control={control}
									rules={{
										required: {
											value: true,
											message: ErrorMessages.required
										},
										minLength: {
											value: lengths.user.username.min,
											message: ErrorMessages.optionalMin(lengths.user.username.min)
										},
										maxLength: {
											value: lengths.user.username.max,
											message: ErrorMessages.optionalMax(lengths.user.username.max)
										}
									}}
									render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
										<InputIcon
											ref={loginRef}
											textContentType="username"
											placeholder="Введите логин"
											autoComplete="username"
											importantForAutofill="yes"
											error={error?.message || data.errors?.username}
											svg={
												<LoginSvg
													error={Boolean(error?.message?.length || data.errors?.username)}
												/>
											}
											autoCapitalize="none"
											onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
											value={value}
											onBlur={onBlur}
											returnKeyType="next"
											returnKeyLabel="Далее"
											submitBehavior="submit"
											onSubmitEditing={() => passwordRef.current?.focus()}
										/>
									)}
								/>
							)}
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
										ref={passwordRef}
										isPassword
										autoCapitalize="none"
										placeholder="Введите пароль"
										textContentType="password"
										autoComplete={isAuth ? 'current-password' : 'new-password'}
										importantForAutofill="yes"
										svg={
											<PasswordSvg
												error={Boolean(error?.message?.length || data.errors?.password)}
											/>
										}
										error={error?.message || data.errors?.password}
										onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
										value={value}
										onBlur={onBlur}
										returnKeyType="done"
										submitBehavior="blurAndSubmit"
										onSubmitEditing={handleSubmit(onSubmit)}
									/>
								)}
							/>

							{isAuth && (
								<LinkCustom
									href="/(password-restore)/firstStep"
									text="Забыли пароль?"
									className="text-blue-3d"
								/>
							)}
						</View>
						<View className="flex-1 mt-[10px] mb-[10px] justify-end">
							{!isAuth && (
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
												<Checkbox
													value={value}
													error={Boolean(error)}
													onValueChange={onChange}
												/>
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
							)}
						</View>
					</Container>
				</KeyboardAwareScrollView>
			</View>
			<KeyboardStickyView offset={hasSoftKeyboard ? { opened: 90, closed: 0 } : {}} style={{ paddingBottom: 10 }}>
				<Container>
					<Button
						variant="white"
						onPress={handleSubmit(onSubmit)}
						isLoading={data.isLoading}
						className="mt-auto"
					>
						{isAuth ? 'Войти' : 'Зарегистрироваться'}
					</Button>
				</Container>
			</KeyboardStickyView>
			<Container>
				<Button variant="white" onPress={handleClickRedirect}>
					{isAuth ? 'Зарегистрироваться' : 'Войти'}
				</Button>
			</Container>
		</Page>
	)
}

export default AuthPage
