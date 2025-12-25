import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'

interface IProps {
	handleClickSave: () => void
	handleClickDelete: () => void
	handleClickClose: () => void
}

const UnfinishedTraining = (props: IProps) => {
	return (
		<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					У вас есть несохраненная
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					тренировка
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.handleClickSave}>
					Сохранить тренировку
				</Button>
				<Button variant="white" onPress={props.handleClickDelete}>
					Удалить тренировку
				</Button>
				<Button variant="white" onPress={props.handleClickClose}>
					Не сейчас
				</Button>
			</View>
		</View>
	)
}

export default UnfinishedTraining
