import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import {
	Alert,
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
import { Notification, NotificationInAppType } from '@/components/Notification'
import { setItem } from '@/store/storage'
import { useLocalSearchParams } from 'expo-router'

export enum AUTH_MODE {
	AUTH = 'auth',
	REGISTRATION = 'registration'
}

const AuthPage = () => {
	const insets = useSafeAreaInsets()
	const { mode } = useLocalSearchParams<{ mode: AUTH_MODE }>()

	const [data, setData] = useState<{
		isChecked: boolean
		mode: AUTH_MODE
		email: string
		password: string
		notificationText?: string
		isLoading: boolean
	}>({
		isChecked: false,
		mode: mode || AUTH_MODE.REGISTRATION,
		email: '',
		password: '',
		notificationText: undefined,
		isLoading: false
	})

	const { login, register } = useAuthStore()

	const handleClickAction = async () => {
		setData((s) => ({ ...s, isLoading: true }))

		if (data.mode === AUTH_MODE.AUTH) {
			const success = await login(data.email, data.password)

			if (!success) {
				setData((s) => ({ ...s, notificationText: 'Неверные учетные данные' }))
				// Alert.alert('Ошибка', 'Неверные учетные данные')
			}
		}

		if (data.mode === AUTH_MODE.REGISTRATION) {
			const success = await register(data.email, data.password)

			if (!success) {
				setData((s) => ({ ...s, notificationText: 'Неверные учетные данные' }))
				// Alert.alert('Ошибка', 'Неверные учетные данные')
			}
			setItem('isAccountExist', { accountExist: true })
		}

		return setData((s) => ({ ...s, isLoading: false }))
	}

	const handleClickRedirect = () => {
		return setData((s) => ({ ...s, mode: s.mode === AUTH_MODE.AUTH ? AUTH_MODE.REGISTRATION : AUTH_MODE.AUTH }))
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
				<Notification
					type={NotificationInAppType.ERROR}
					text={data.notificationText}
					clearErrorCallback={() => setData((s) => ({ ...s, notificationText: undefined }))}
				/>
				<Container className="flex-1 mb-[10px]">
					<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
						<View className="flex-grow mt-[20px]">
							<Text className="text-white text-xl" style={{ fontFamily: fontFamily.bold }}>
								{data.mode === AUTH_MODE.AUTH ? 'Авторизация' : 'Регистрация'}
							</Text>
							<View className="gap-[10px] mt-[65px]">
								<InputIcon
									textContentType="emailAddress"
									keyboardType="email-address"
									placeholder="Введите email"
									error={true}
									svg={<EmailSvg error={true} />}
									value={data.email}
									onChangeText={(text) => setData((s) => ({ ...s, email: text }))}
									autoCapitalize="none"
								/>
								<InputIcon
									isPassword
									autoCapitalize="none"
									placeholder="Введите пароль"
									svg={<PasswordSvg error={false} />}
									value={data.password}
									onChangeText={(text) => setData((s) => ({ ...s, password: text }))}
								/>
							</View>
						</View>
					</TouchableWithoutFeedback>
					{data.mode !== AUTH_MODE.AUTH && (
						<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
							<View className="flex-row gap-[10px]">
								<View className="pt-[3px]">
									<Checkbox
										value={data.isChecked}
										onValueChange={() => setData((s) => ({ ...s, isChecked: !s.isChecked }))}
									/>
								</View>
								<Text
									className="flex-shrink mb-[37px] text-gray-ab text-[11px]"
									style={{ fontFamily: fontFamily.regular }}
								>
									Согласен с{' '}
									<LinkCustom href="/document" text="условиями обработки" className="text-blue-3d" />{' '}
									персональных данных и{' '}
									<LinkCustom
										href="/document"
										text="политикой конфиденциальности"
										className="text-blue-3d"
									/>
								</Text>
							</View>
						</TouchableWithoutFeedback>
					)}
					<Button variant="white" onPress={handleClickAction} isLoading={data.isLoading}>
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
