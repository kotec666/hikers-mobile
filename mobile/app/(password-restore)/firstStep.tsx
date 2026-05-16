import React from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { View, Text, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import MailboxSvg from '@/components/svg/MailboxSvg'
import { InputIcon } from '@/components/ui/InputIcon'
import EmailSvg from '@/components/svg/EmailSvg'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Page } from '@/components/ui/Page'

const FirstStepPage = () => {
	const { push } = useSafeNavigation()

	const handlePressButton = () => {
		push('/(password-restore)/secondStep')
	}

	return (
		<Page>
			<Container className="flex-1">
				<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
						<View className="flex-1">
							<HeaderBack>Назад</HeaderBack>
							<View className="flex-1 justify-center gap-[24px]">
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
									{/*<Controller*/}
									{/*	name="email"*/}
									{/*	control={control}*/}
									{/*	rules={{*/}
									{/*		required: {*/}
									{/*			value: true,*/}
									{/*			message: ErrorMessages.required*/}
									{/*		},*/}
									{/*		pattern: {*/}
									{/*			value: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/,*/}
									{/*			message: ErrorMessages.email*/}
									{/*		},*/}
									{/*		minLength: {*/}
									{/*			value: lengths.user.email.min,*/}
									{/*			message: ErrorMessages.optionalMin(lengths.user.email.min)*/}
									{/*		},*/}
									{/*		maxLength: {*/}
									{/*			value: lengths.user.email.max,*/}
									{/*			message: ErrorMessages.optionalMax(lengths.user.email.max)*/}
									{/*		}*/}
									{/*	}}*/}
									{/*	render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (*/}
									<InputIcon
										textContentType="emailAddress"
										keyboardType="email-address"
										placeholder="Введите email"
										// error={error?.message || data.errors?.email}
										svg={
											<EmailSvg
												// error={Boolean(error?.message?.length || data.errors?.email)}
												error={false}
											/>
										}
										autoCapitalize="none"
										// onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
										// value={value}
										// onBlur={onBlur}
									/>
									{/*	)}*/}
									{/*/>*/}
								</View>
								<View className="gap-[24px]">
									<Button variant="black" onPress={handlePressButton}>
										Отправить код повторно (0:59)
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

export default FirstStepPage
