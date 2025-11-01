import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
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
import { getItem, setItem } from '@/store/storage'
import { useLocalSearchParams } from 'expo-router'
import { Controller, useForm } from 'react-hook-form'
import { useErrorMessage } from '@/hooks/useErrorMessage'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { loginUser, registrationUser } from '@/api/auth'
import { cn } from '@/helpers/cn'
import { lengths } from '@shared/lengths'
import * as Haptics from 'expo-haptics'

export enum AUTH_MODE {
	AUTH = 'auth',
	REGISTRATION = 'registration'
}

interface IAuthFormState {
	email: string
	password: string
	agree?: boolean
}

const AuthPage = () => {
	const insets = useSafeAreaInsets()
	const { mode } = useLocalSearchParams<{ mode: AUTH_MODE }>()
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
		errors?: { [key: string]: string | boolean | undefined }
	}>({
		mode: mode || AUTH_MODE.REGISTRATION,
		notificationText: undefined,
		isLoading: false,
		errors: {} as { [key: string]: string | boolean | undefined }
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

				login(loginData.token, restParameters)
				if (!getItem('isAccountExist')?.accountExist) {
					setItem('isAccountExist', { accountExist: true })
				}
			} catch (e) {
				const errors = await e.response.json()
				console.log(errors)
				const formattedErrors = getFieldsErrors(errors)
				setData((s) => ({ ...s, errors: formattedErrors }))
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
				// Alert.alert('Ошибка', 'Неверные учетные данные')
			} finally {
				setData((s) => ({ ...s, isLoading: false }))
			}
		}

		if (data.mode === AUTH_MODE.REGISTRATION) {
			try {
				const regData = await registrationUser({ email: authFormState.email, password: authFormState.password })
				const { token, ...restParameters } = regData

				login(regData.token, restParameters)
				setItem('isAccountExist', { accountExist: true })
			} catch (e) {
				console.log(e)
				const errors = await e.response.json()
				console.log(JSON.stringify(errors))
				const formattedErrors = getFieldsErrors(errors)
				setData((s) => ({ ...s, errors: formattedErrors }))
				Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
				// Alert.alert('Ошибка', 'Неверные учетные данные')
			} finally {
				setData((s) => ({ ...s, isLoading: false }))
			}
		}
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
				<Container className="flex-1 mb-[10px]">
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View className="flex-grow mt-[20px]">
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
											onChangeText={onChange}
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
											svg={
												<PasswordSvg
													error={Boolean(error?.message?.length || data.errors?.password)}
												/>
											}
											error={error?.message || data.errors?.password}
											onChangeText={onChange}
											value={value}
											onBlur={onBlur}
										/>
									)}
								/>
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
										render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
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
			<StatusBar style="light" />
		</SafeAreaProvider>
	)
}

const styles = StyleSheet.create({
	container: {
		flex: 1
	}
})

export default AuthPage
