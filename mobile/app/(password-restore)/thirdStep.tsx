import React from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { View, Text, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import AlertCircleSvg from '@/components/svg/AlertCircleSvg'
import { InputIcon } from '@/components/ui/InputIcon'
import PasswordSvg from '@/components/svg/PasswordSvg'
import { Page } from '@/components/ui/Page'

const ThirdStepPage = () => {
	const [hasError, setHasError] = React.useState(true)

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
										{/*<Controller*/}
										{/*	name="newPassword"*/}
										{/*	control={control}*/}
										{/*	rules={{*/}
										{/*		required: {*/}
										{/*			value: true,*/}
										{/*			message: ErrorMessages.required*/}
										{/*		},*/}
										{/*		minLength: {*/}
										{/*			value: lengths.user.password.min,*/}
										{/*			message: ErrorMessages.optionalMin(lengths.user.password.min)*/}
										{/*		},*/}
										{/*		maxLength: {*/}
										{/*			value: lengths.user.password.max,*/}
										{/*			message: ErrorMessages.optionalMax(lengths.user.password.max)*/}
										{/*		}*/}
										{/*	}}*/}
										{/*	render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (*/}
										<InputIcon
											isPassword
											autoCapitalize="none"
											placeholder="Введите пароль"
											textContentType="password"
											keyboardType="numbers-and-punctuation"
											svg={
												<PasswordSvg
													// error={Boolean(error?.message?.length || data.errors?.password)}
													error={false}
												/>
											}
											// error={error?.message || data.errors?.password}
											// onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
											// value={value}
											// onBlur={onBlur}
										/>
										{/*	)}*/}
										{/*/>*/}
										{/*<Controller*/}
										{/*	name="repeatPassword"*/}
										{/*	control={control}*/}
										{/*	rules={{*/}
										{/*		required: {*/}
										{/*			value: true,*/}
										{/*			message: ErrorMessages.required*/}
										{/*		},*/}
										{/*		minLength: {*/}
										{/*			value: lengths.user.password.min,*/}
										{/*			message: ErrorMessages.optionalMin(lengths.user.password.min)*/}
										{/*		},*/}
										{/*		maxLength: {*/}
										{/*			value: lengths.user.password.max,*/}
										{/*			message: ErrorMessages.optionalMax(lengths.user.password.max)*/}
										{/*		}*/}
										{/*	}}*/}
										{/*	render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (*/}
										<InputIcon
											isPassword
											autoCapitalize="none"
											placeholder="Повтор пароля"
											textContentType="password"
											keyboardType="numbers-and-punctuation"
											svg={
												<PasswordSvg
													// error={Boolean(error?.message?.length || data.errors?.password)}
													error={false}
												/>
											}
											// error={error?.message || data.errors?.password}
											// onChangeText={(text) => onChange(text.replace(/\s/g, ''))} // Удаляем пробелы
											// value={value}
											// onBlur={onBlur}
										/>
										{/*	)}*/}
										{/*/>*/}

										{hasError && (
											<View className="flex-row items-center gap-[8px]">
												<AlertCircleSvg />
												<Text
													className="text-base text-red-ff4"
													style={{ fontFamily: fontFamily.medium }}
												>
													Пароли не совпадают
												</Text>
											</View>
										)}
									</View>
								</View>
								<Button variant="black">Сохранить новый пароль</Button>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Container>
		</Page>
	)
}

export default ThirdStepPage
