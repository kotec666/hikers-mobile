import React from 'react'
import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Link } from 'expo-router'
import { IFoundPost } from '@/api/search'
import { TrainingType } from '@/shared/enums'
import { WorkoutTypesData } from '@/constants/WorkoutTypes'
import { formatRelativeDate } from '@/helpers/formatRelativeDate'

const PostSearchResult = (props: IFoundPost) => {
	const renderIcon = (workoutType?: TrainingType) => {
		if (!workoutType) return
		const found = WorkoutTypesData.find((w) => w.type === workoutType)
		if (found) {
			return <found.IconComponent color="black" width={26} height={26} />
		}
	}

	return (
		<Link
			href={{
				pathname: '/posts/[id]',
				params: { id: props.id }
			}}
		>
			<View className="flex-row items-center w-full justify-between">
				<View className="flex-row items-center gap-[15px]">
					<View className="w-[50px] h-[50px] rounded-[15px] bg-white items-center justify-center">
						{renderIcon(props.training.type)}
					</View>
					<Text className="text-base text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
						{props.title}
					</Text>
				</View>
				<Text className="text-xs text-gray-ab" style={{ fontFamily: fontFamily.regular }}>
					{formatRelativeDate(props.createdAt)}
				</Text>
			</View>
		</Link>
	)
}

export default PostSearchResult
