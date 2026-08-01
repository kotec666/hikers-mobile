import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'

const NotFinishedWorkout = (props: {
	restoreAndContinue: () => void
	deleteNotFinishedWorkout: () => void
	close: () => void
}) => {
	return (
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
					Сейчас нельзя начать новую тренировку,
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
					потому что у вас есть незавершённая тренировка
				</Text>
				<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg text-center">
					Выберите дальнейшее действие
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.restoreAndContinue}>
					Восстановить и продолжить
				</Button>
				<Button variant="white" onPress={props.deleteNotFinishedWorkout}>
					Удалить
				</Button>
				<Button variant="white" onPress={props.close}>
					Спросить позже
				</Button>
			</View>
		</View>
	)
}

export default NotFinishedWorkout
