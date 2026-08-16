import React from 'react'
import { StyleProp, Text, View, ViewStyle } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import PenSvg from '@/components/svg/PenSvg'
import CheckMarkIconSvg from '@/components/svg/CheckMarkIconSvg'
import { cn } from '@/helpers/cn'
import { MeasuringUnit } from '@/shared/enums'
import { getNoun } from '@/helpers/getNoun'
import { useTranslation } from 'react-i18next'

const WorkoutStats = (props: {
	style?: StyleProp<ViewStyle>
	isEditMode?: boolean
	isCheckmarkExist?: boolean
	className?: string
	label?: string
	goal: number
	measuringUnit: MeasuringUnit
}) => {
	const { t } = useTranslation()

	const getMeasuringUnit = (unit: MeasuringUnit, goal: number) => {
		const symbolWord = {
			one: {
				count: t('measurementUnits.count.one'),
				reps: t('measurementUnits.reps.one')
			},
			two: {
				count: t('measurementUnits.count.two'),
				reps: t('measurementUnits.reps.two')
			},
			five: {
				count: t('measurementUnits.count.five'),
				reps: t('measurementUnits.reps.five')
			}
		}

		switch (unit) {
			case MeasuringUnit.METER:
				return 'measurementUnits.meters.short'

			case MeasuringUnit.KILOMETER:
				return 'measurementUnits.km.short'

			case MeasuringUnit.COUNT: {
				const { word } = getNoun(goal, symbolWord.one.count, symbolWord.two.count, symbolWord.five.count)
				return word
			}

			case MeasuringUnit.REPEATS: {
				const { word } = getNoun(goal, symbolWord.one.reps, symbolWord.two.reps, symbolWord.five.reps)
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
					{props.goal} {t(getMeasuringUnit(props.measuringUnit, props.goal))}
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
