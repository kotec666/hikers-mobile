import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { TrainingType } from '@shared/enums'
import { useTranslation } from 'react-i18next'

interface IWorkoutTypeProps {
	icon: (color?: string) => React.JSX.Element
	type: TrainingType
	name: string
	handleChange: (workoutType: TrainingType) => void
}

const WorkoutType = (props: IWorkoutTypeProps) => {
	const { t } = useTranslation()
	return (
		<TouchableOpacity onPress={() => props.handleChange(props.type)} className="flex-row gap-[15px] items-center">
			<View className="w-[57px] h-[57px] bg-white rounded-[18px] items-center justify-center">
				{props.icon()}
			</View>
			<Text style={{ fontFamily: fontFamily.medium }} className="text-base text-white">
				{t(props.name)}
			</Text>
		</TouchableOpacity>
	)
}

export default WorkoutType
