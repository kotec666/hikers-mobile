import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

interface IWorkoutTypeProps {
	icon: (color?: string) => React.JSX.Element
	id: number
	name: string
	handleChange: (workoutId: number) => void
}

const WorkoutType = (props: IWorkoutTypeProps) => {
	return (
		<TouchableOpacity onPress={() => props.handleChange(props.id)} className="flex-row gap-[15px] items-center">
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
