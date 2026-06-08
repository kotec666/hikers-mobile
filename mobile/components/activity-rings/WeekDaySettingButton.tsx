import React from 'react'
import { View, Text } from 'react-native'
import { Colors } from '@/constants/Colors'
import { fontFamily } from '@/constants/Fonts'
import MinusSvg from '@/components/svg/MinusSvg'
import PlusSvg from '@/components/svg/PlusSvg'
import StepperButton from '@/components/activity-rings/StepperButton'

interface IWeekDaySettingButtonProps {
	label: string
	goal: number
	onChange: (delta: number) => void
	onLongPressStart: (delta: number) => void
	onLongPressStop: () => void
}

const WeekDaySettingButton = ({
	label,
	goal,
	onChange,
	onLongPressStart,
	onLongPressStop
}: IWeekDaySettingButtonProps) => {
	return (
		<View
			className="flex-row justify-between items-center"
			style={{
				padding: 16,
				borderRadius: 16,
				backgroundColor: Colors['gray-2c']
			}}
		>
			<Text className="text-white" style={{ fontSize: 18, fontFamily: fontFamily.bold }}>
				{label}
			</Text>
			<View className="flex-row gap-[10px] items-center">
				<StepperButton
					onPress={() => onChange(-10)}
					onLongPress={() => onLongPressStart(-30)}
					onPressOut={onLongPressStop}
				>
					<MinusSvg />
				</StepperButton>
				<View>
					<Text
						className="text-white text-center"
						style={{ fontSize: 18, fontFamily: fontFamily.bold, fontVariant: ['tabular-nums'] }}
					>
						{goal}
					</Text>
					<Text
						className="text-gray-ab opacity-50 text-center"
						style={{ fontSize: 12, fontFamily: fontFamily.bold, lineHeight: 9 }}
					>
						ККАЛ
					</Text>
				</View>
				<StepperButton
					onPress={() => onChange(10)}
					onLongPress={() => onLongPressStart(30)}
					onPressOut={onLongPressStop}
				>
					<PlusSvg />
				</StepperButton>
			</View>
		</View>
	)
}

export default WeekDaySettingButton
