import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import PenSvg from '@/components/svg/PenSvg'
import CheckMarkIconSvg from '@/components/svg/CheckMarkIconSvg'
import { cn } from '@/helpers/cn'

const WorkoutStats = (props: { isEditMode?: boolean; isChooseMode?: boolean; className?: string }) => {
	return (
		<View className={cn('relative flex-1', props.className)}>
			<View className="bg-black-25 rounded-[15px] px-[15px] w-full items-center" style={{ paddingVertical: 10 }}>
				<Text className="text-xs text-white" style={{ fontFamily: fontFamily.medium }}>
					Бег
				</Text>
				<Text className="text-xs text-green-main" style={{ fontFamily: fontFamily.bold }}>
					400 км
				</Text>
			</View>
			{props.isEditMode && (
				<View
					className="absolute bg-white rounded-full w-[25px] h-[25px] items-center justify-center"
					style={{ bottom: -5, right: -5 }}
				>
					<PenSvg />
				</View>
			)}
			{props.isChooseMode && (
				<View
					className="absolute bg-white rounded-full w-[25px] h-[25px] items-center justify-center"
					style={{ bottom: -5, right: -5 }}
				>
					<CheckMarkIconSvg width={13} height={13} />
				</View>
			)}
		</View>
	)
}

export default WorkoutStats
