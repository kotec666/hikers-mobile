import React from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { View, Text, Keyboard, Pressable } from 'react-native'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import Checkbox from '@/components/ui/Checkbox'
import { fontFamily } from '@/constants/Fonts'
import { Page } from '@/components/ui/Page'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'

const ReportAProblem = () => {
	return (
		<Page>
			<Container className="flex-1">
				<KeyboardAvoidingView style={{ flex: 1 }} keyboardVerticalOffset={60} behavior="padding">
					<Pressable onPress={Keyboard.dismiss} accessible={false} style={{ flex: 1 }}>
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
									</View>
								</View>
							</View>
							<View className="flex-1 justify-end">
								<Button variant="white">Отправить сообщение</Button>
							</View>
						</View>
					</Pressable>
				</KeyboardAvoidingView>
			</Container>
		</Page>
	)
}

export default ReportAProblem
