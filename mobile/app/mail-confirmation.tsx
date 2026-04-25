import React, { useCallback } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { View, Text, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import AlertCircleSvg from '@/components/svg/AlertCircleSvg'
import MailboxSvg from '@/components/svg/MailboxSvg'
import { OTPInput } from '@/components/ui/OTP/OTPInput'
import * as Haptics from 'expo-haptics'

const MailConfirmation = () => {
	const insets = useSafeAreaInsets()
	const [hasError, setHasError] = React.useState(false)

	const onDone = useCallback((code: string) => {
		console.log(`onDone: ${code}`)
		Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
		setHasError(true)
	}, [])

	const handleClearOTPError = () => {
		setHasError(false)
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<Container className="flex-1">
				<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
						<View className="flex-1">
							<HeaderBack>Назад</HeaderBack>
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
											Мы отправили код на hikers_app@gmail.com
										</Text>
									</View>
									<View className="gap-[12px]">
										<Text className="text-lg text-white" style={{ fontFamily: fontFamily.medium }}>
											Введите код
										</Text>
										<OTPInput
											hasError={hasError}
											length={5}
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
												Неверный код. Попробуйте снова
											</Text>
										</View>
									)}
									<Button variant="black">Отправить код повторно (0:59)</Button>
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
		</SafeAreaProvider>
	)
}

export default MailConfirmation
