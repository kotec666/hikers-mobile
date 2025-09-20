import React from 'react'
import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

interface IProps {
	title: string
	icon?: React.JSX.Element
}

const WorkoutHistoryListItem = (props: IProps) => {
	return (
		<View className="flex-row gap-[15px] items-center">
			<View className="w-[50px] h-[50px] rounded-[15px] bg-white items-center justify-center">{props.icon}</View>
			<Text className="text-gray-ab text-base" style={{ fontFamily: fontFamily.medium }}>
				{props.title}
			</Text>
		</View>
	)
}

export default WorkoutHistoryListItem
