import React, { ReactElement } from 'react'
import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

interface IWorkoutTypeProps {
	icon: ReactElement
	name: string
}

const WorkoutType = (props: IWorkoutTypeProps) => {
	return (
		<View className="flex-row gap-[15px] items-center">
			<View className="w-[57px] h-[57px] bg-white rounded-[18px] items-center justify-center">{props.icon}</View>
			<Text style={{ fontFamily: fontFamily.medium }} className="text-base text-white">
				{props.name}
			</Text>
		</View>
	)
}

export default WorkoutType
