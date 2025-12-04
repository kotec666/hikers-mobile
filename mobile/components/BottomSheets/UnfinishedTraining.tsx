import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'

const UnfinishedTraining = () => {
	return (
		<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					У вас есть незавершённая
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					тренировка
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white">Продолжить тренировку</Button>
				<Button variant="white">Завершить тренировку</Button>
				<Button variant="white">Не сохранять</Button>
			</View>
		</View>
	)
}

export default UnfinishedTraining
