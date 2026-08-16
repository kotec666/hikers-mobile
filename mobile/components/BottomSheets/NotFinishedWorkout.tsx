import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

const NotFinishedWorkout = (props: {
	restoreAndContinue: () => void
	deleteNotFinishedWorkout: () => void
	close: () => void
}) => {
	const { t } = useTranslation()
	return (
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
					{t('WorkoutPage.bottomSheets.notFinishedWorkout.cannotStartNow')}
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
					{t('WorkoutPage.bottomSheets.notFinishedWorkout.uHaveUnfinishedWorkout')}
				</Text>
				<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg text-center">
					{t('WorkoutPage.bottomSheets.notFinishedWorkout.selectNextAction')}
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.restoreAndContinue}>
					{t('WorkoutPage.bottomSheets.actions.restoreAndContinue')}
				</Button>
				<Button variant="white" onPress={props.deleteNotFinishedWorkout}>
					{t('common.delete')}
				</Button>
				<Button variant="white" onPress={props.close}>
					{t('WorkoutPage.bottomSheets.actions.askLater')}
				</Button>
			</View>
		</View>
	)
}

export default NotFinishedWorkout
