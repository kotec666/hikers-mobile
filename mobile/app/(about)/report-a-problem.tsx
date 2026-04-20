import React from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { View, Text, Platform, Keyboard, KeyboardAvoidingView, TouchableWithoutFeedback } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { CharacterCounter } from '@/components/ui/CharacterCounter'
import Checkbox from '@/components/ui/Checkbox'
import { fontFamily } from '@/constants/Fonts'

const ReportAProblem = () => {
	const insets = useSafeAreaInsets()
	return (
		<SafeAreaView style={{ flex: 1 }}>
			<Container className="flex-1">
				<KeyboardAvoidingView
					style={{ flex: 1 }}
					keyboardVerticalOffset={insets.top + 10}
					behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				>
					<TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
						<View className="flex-1">
							<HeaderBack>Сообщить о проблеме</HeaderBack>
							<View className="justify-center gap-[24px] mt-[20px]">
								<View className="gap-[20px]">
									<Input
										multiline
										placeholder="Подробно опишите проблему, которую вы обнаружили"
										// error={error?.message || state.errors?.description}
										// onChangeText={onChange}
										// value={value}
										// onBlur={onBlur}
									/>
									<View className="flex-row justify-between">
										<View className="flex-row items-center gap-[10px]">
											<Checkbox
											// value={value}
											// error={Boolean(error)}
											// onValueChange={onChange}
											/>
											<Text
												className="flex-shrink text-[11px] text-white"
												style={{ fontFamily: fontFamily.regular }}
											>
												Прикрепить данные о моём устройстве
											</Text>
										</View>
										<CharacterCounter
											valueLength={15}
											maxLength={50}
											// valueLength={currentLength}
											// maxLength={maxLength}
										/>
									</View>
								</View>
							</View>
							<View className="flex-1 justify-end">
								<Button variant="white">Отправить сообщение</Button>
							</View>
						</View>
					</TouchableWithoutFeedback>
				</KeyboardAvoidingView>
			</Container>
		</SafeAreaView>
	)
}

export default ReportAProblem
