import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'

interface IProps {
	isSaving: boolean
	handleClickSave: () => void
	handleClickDelete: () => void
	handleClickClose: () => void
}

const UnsavedTrainings = (props: IProps) => {
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
				<Button
					variant="white"
					onPress={props.handleClickSave}
					isLoading={props.isSaving}
					disabled={props.isSaving}
				>
					Сохранить тренировку
				</Button>
				<Button variant="white" onPress={props.handleClickDelete} disabled={props.isSaving}>
					Удалить тренировку
				</Button>
				<Button variant="white" onPress={props.handleClickClose} disabled={props.isSaving}>
					Не сейчас
				</Button>
			</View>
		</View>
	)
}

export default UnsavedTrainings
