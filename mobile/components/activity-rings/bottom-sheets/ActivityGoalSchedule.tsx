import React from 'react'
import { ScrollView, View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'
import { fontFamily } from '@/constants/Fonts'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WeeklyGoalsChart from '@/components/activity-rings/WeeklyGoalsChart'
import WeekDaySettingButton from '@/components/activity-rings/WeekDaySettingButton'
import { DayGoal } from '@/app/daily-activity/kcal'
import { useTranslation } from 'react-i18next'

interface IProps {
	schedule: DayGoal[]
	updateGoal: (dayIndex: number, delta: number) => void
	onLongPressStart: (dayIndex: number, delta: number) => void
	onLongPressStop: () => void
	isVisible: boolean
}

const ActivityGoalSchedule = ({ schedule, updateGoal, onLongPressStart, onLongPressStop, isVisible }: IProps) => {
	const insets = useSafeAreaInsets()
	const { t } = useTranslation()

	return (
		<ScrollView
			contentContainerStyle={{ paddingBottom: insets.bottom + 40, opacity: isVisible ? 1 : 0 }}
			pointerEvents={isVisible ? 'auto' : 'none'}
		>
			<Container className="gap-3">
				<View className="gap-2">
					<Text className="text-white" style={{ fontSize: 16, fontFamily: fontFamily.bold }}>
						{t('DailyActivity.goalSchedule.title')}
					</Text>
					<Text className="text-gray-a1" style={{ fontSize: 14, fontFamily: fontFamily.regular }}>
						{t('DailyActivity.goalEveryDay.description')}
					</Text>
				</View>
				<View className="gap-3">
					<WeeklyGoalsChart data={schedule} />
					<View className="gap-3">
						{schedule.map((day, idx) => (
							<WeekDaySettingButton
								key={day.day}
								label={day.label}
								goal={day.goal}
								onChange={(delta) => updateGoal(idx, delta)}
								onLongPressStart={(delta) => onLongPressStart(idx, delta)}
								onLongPressStop={onLongPressStop}
							/>
						))}
					</View>
				</View>
			</Container>
		</ScrollView>
	)
}

export default ActivityGoalSchedule
