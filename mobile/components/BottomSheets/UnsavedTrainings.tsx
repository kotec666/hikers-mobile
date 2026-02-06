import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { getNoun } from '@/helpers/getNoun'

interface IProps {
	isSaving: boolean
	handleClickSave: () => void
	handleClickDelete: () => void
	handleClickClose: () => void
	unsavedTrainingsCount: number
}

const UnsavedTrainings = (props: IProps) => {
	const { number, word } = getNoun(
		props.unsavedTrainingsCount,
		'несохранённая тренировка',
		'несохранённые тренировки',
		'несохранённых тренировок'
	)

	const [adj, noun] = word.split(' ')

	return (
		<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					У вас есть {number} {adj}
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					{noun}
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
