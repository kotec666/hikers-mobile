import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { TrainingType } from '@shared/enums'

interface IWorkoutTypeProps {
	icon: (color?: string) => React.JSX.Element
	type: TrainingType
	name: string
	handleChange: (workoutType: TrainingType) => void
}

const WorkoutType = (props: IWorkoutTypeProps) => {
	return (
		<TouchableOpacity onPress={() => props.handleChange(props.type)} className="flex-row gap-[15px] items-center">
			<View className="w-[57px] h-[57px] bg-white rounded-[18px] items-center justify-center">
				{props.icon()}
			</View>
			<Text style={{ fontFamily: fontFamily.medium }} className="text-base text-white">
				{props.name}
			</Text>
		</TouchableOpacity>
	)
}

export default WorkoutType
