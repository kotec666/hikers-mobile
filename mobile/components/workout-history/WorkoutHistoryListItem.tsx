import React from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Colors } from '@/constants/Colors'
import { Link } from 'expo-router'
import { VIEWWORKOUT_MODE } from '@/app/training/viewWorkout'

interface IIcon {
	iconSvg: React.JSX.Element | null
	iconCb?: () => void
	disabled?: boolean
}

interface IProps {
	id?: string
	title: string
	icon?: React.JSX.Element
	actionIcon?: IIcon | IIcon[]
	isLoading?: boolean
	isHistoryListItem?: boolean
}

const WorkoutHistoryListItemContent = (props: IProps) => {
	return (
		<>
			<View className="flex-row gap-[15px] items-center">
				<View className="w-[50px] h-[50px] rounded-[15px] bg-white items-center justify-center">
					{props.icon}
				</View>
				<Text className="text-gray-ab text-base" style={{ fontFamily: fontFamily.medium }}>
					{props.title}
				</Text>
			</View>
			{props.isLoading ? (
				<ActivityIndicator size="small" color={Colors['green-main']} />
			) : props.actionIcon && Array.isArray(props.actionIcon) ? (
				<View className="flex-row gap-3">
					{props.actionIcon.map((iconItem, index) => (
						<TouchableOpacity
							key={index}
							style={{ opacity: iconItem.disabled ? 0.4 : 1 }}
							disabled={iconItem.disabled}
							onPress={iconItem.iconCb}
						>
							{iconItem.iconSvg}
						</TouchableOpacity>
					))}
				</View>
			) : (
				<TouchableOpacity
					style={{ opacity: props.actionIcon?.disabled ? 0.4 : 1 }}
					disabled={props.actionIcon?.disabled}
					onPress={props.actionIcon?.iconCb}
				>
					{props.actionIcon?.iconSvg}
				</TouchableOpacity>
			)}
		</>
	)
}

const WorkoutHistoryListItem = (props: IProps) => {
	if (props.isHistoryListItem) {
		return (
			<Link
				href={`/training/viewWorkout?mode=${VIEWWORKOUT_MODE.FROM_HISTORY}&historyTrainingId=${props.id}`}
				className="flex-row items-center justify-between"
			>
				<WorkoutHistoryListItemContent {...props} />
			</Link>
		)
	}

	return (
		<View className="flex-row items-center justify-between">
			<WorkoutHistoryListItemContent {...props} />
		</View>
	)
}

export default WorkoutHistoryListItem
