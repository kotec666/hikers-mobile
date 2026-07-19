import React from 'react'
import MinusSvg from '@/components/svg/MinusSvg'
import PlusSvg from '@/components/svg/PlusSvg'
import StepperButton from '@/components/activity-rings/StepperButton'
import { Container } from '@/components/ui/Container'
import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

interface IProps {
	currentGoal: number
	updateGoal: (dayIndex: number, delta: number) => void
	onLongPressStart: (dayIndex: number, delta: number) => void
	onLongPressStop: () => void
}

const ActivityGoalEveryDay = ({ currentGoal, updateGoal, onLongPressStart, onLongPressStop }: IProps) => {
	return (
		<Container className="gap-6">
			<View className="gap-2">
				<Text className="text-white" style={{ fontSize: 16, fontFamily: fontFamily.bold }}>
					Дневная цель подвижности
				</Text>
				<Text className="text-gray-a1" style={{ fontSize: 14, fontFamily: fontFamily.regular }}>
					Задайте ежедневную цель в зависимости от Вашего реального или желаемого уровня физической
					активности.
				</Text>
			</View>
			<View className="flex-row items-center justify-between">
				<StepperButton
					size={50}
					onPress={() => updateGoal(0, -10)}
					onLongPress={() => onLongPressStart(0, -30)}
					onPressOut={onLongPressStop}
				>
					<MinusSvg />
				</StepperButton>
				<View className="items-center">
					<Text className="text-white" style={{ fontSize: 45, fontFamily: fontFamily.bold }}>
						{currentGoal}
					</Text>
					<Text className="text-white" style={{ fontSize: 16, fontFamily: fontFamily.bold }}>
						ККАЛ/ДЕНЬ
					</Text>
				</View>
				<StepperButton
					size={50}
					onPress={() => updateGoal(0, 10)}
					onLongPress={() => onLongPressStart(0, 30)}
					onPressOut={onLongPressStop}
				>
					<PlusSvg />
				</StepperButton>
			</View>
		</Container>
	)
}

export default ActivityGoalEveryDay
