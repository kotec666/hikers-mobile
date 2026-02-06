import React from 'react'
import { StyleProp, Text, View, ViewStyle } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import PenSvg from '@/components/svg/PenSvg'
import CheckMarkIconSvg from '@/components/svg/CheckMarkIconSvg'
import { cn } from '@/helpers/cn'
import { MeasuringUnit } from '../../../../shared/enums'
import { getNoun } from '@/helpers/getNoun'

const WorkoutStats = (props: {
	style?: StyleProp<ViewStyle>
	isEditMode?: boolean
	isCheckmarkExist?: boolean
	className?: string
	label?: string
	goal: number
	measuringUnit: MeasuringUnit
}) => {
	const getMeasuringUnit = (unit: MeasuringUnit, goal: number) => {
		switch (unit) {
			case MeasuringUnit.METER:
				return 'м'

			case MeasuringUnit.KILOMETER:
				return 'км'

			case MeasuringUnit.COUNT: {
				const { word } = getNoun(goal, 'раз', 'раза', 'раз')
				return word
			}

			case MeasuringUnit.REPEATS: {
				const { word } = getNoun(goal, 'повторение', 'повторения', 'повторений')
				return word
			}

			default:
				return ''
		}
	}

	return (
		<View className={cn('relative', props.className)} style={props.style}>
			<View className="bg-black-25 rounded-[15px] px-[15px] w-full items-center py-[20px]">
				<Text className="text-xs text-white" style={{ fontFamily: fontFamily.medium }}>
					{props.label}
				</Text>
				<Text className="text-xs text-green-main" style={{ fontFamily: fontFamily.bold }}>
					{props.goal} {getMeasuringUnit(props.measuringUnit, props.goal)}
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
			{props.isCheckmarkExist && (
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
