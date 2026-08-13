import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Rings } from '@/components/activity-rings/Rings'
import { fontFamily } from '@/constants/Fonts'
import { Motion } from '@legendapp/motion'
import RoundedPlusMinusSvg from '@/components/svg/RoundedPlusMinusSvg'
import CircleSvg from '@/components/svg/CircleSvg'
import CalendarSvg from '@/components/svg/CalendarSvg'
import { MetricContainer } from '@/components/activity-rings/MetricContainer'
import FootprintsSvg from '@/components/svg/FootprintsSvg'
import DistanceSvg from '@/components/svg/DistanceSvg'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'
import { Menu } from '@/components/ui/Menu/Menu'

interface IProps {
	handlePressChangeGoalToday: () => Promise<void>
	handlePressChangeGoalSchedule: () => Promise<void>
	handlePressChangeGoal: () => Promise<void>
	isToday?: boolean
}

const ActivityPageMainContent = ({
	handlePressChangeGoalToday,
	handlePressChangeGoalSchedule,
	handlePressChangeGoal,
	isToday = false
}: IProps) => {
	const { t } = useTranslation()

	return (
		<ScrollView>
			<View className="flex-1 gap-4">
				<View className="flex-1 py-6">
					<Rings isAnimated circleSize={280} />
				</View>
				<View className="flex-row items-end justify-between ">
					<View>
						<Text className="text-gray-ab text-base" style={{ fontFamily: fontFamily.medium }}>
							{t('DailyActivity.mobility')}
						</Text>
						<Text className="text-green-main" style={{ fontSize: 36, fontFamily: fontFamily.bold }}>
							45/200 {t('DailyActivity.kcalShort')}
						</Text>
					</View>
					<View style={{ paddingBottom: 5 }}>
						{isToday && (
							<Menu
								menuWidth={260}
								menuHeight={150}
								actions={[
									{
										id: 'changeGoalToday',
										title: t('DailyActivity.changeGoalToday'),
										image: 'square.and.pencil',
										icon: <CircleSvg />,
										onPress: handlePressChangeGoalToday
									},
									{
										id: 'changeSchedule',
										title: t('DailyActivity.changeSchedule'),
										image: 'calendar',
										icon: <CalendarSvg />,
										onPress: handlePressChangeGoalSchedule
									}
								]}
							>
								<Motion.View className="bg-gray-1c w-[40px] h-[40px] rounded-full items-center justify-center">
									<Motion.View
										whileTap={{ scale: 0.8 }}
										transition={{
											type: 'spring',
											damping: 20,
											stiffness: 400
										}}
									>
										<RoundedPlusMinusSvg />
									</Motion.View>
								</Motion.View>
							</Menu>
						)}
					</View>
				</View>
				<View>
					<Text className="text-red-500">
						{/* @TODO График */}
						{t('DailyActivity.chartPlaceholder')}
					</Text>
				</View>
				<View className="flex-row gap-4">
					<MetricContainer value="1 226" title={t('DailyActivity.steps')} icon={<FootprintsSvg />} />
					<MetricContainer
						value={`0.87 ${t('measurementUnits.km.short')}`}
						title={t('DailyActivity.distance')}
						icon={<DistanceSvg />}
					/>
				</View>
				{isToday && (
					<Button variant="white" onPress={handlePressChangeGoal}>
						{t('DailyActivity.changeGoal')}
					</Button>
				)}
			</View>
		</ScrollView>
	)
}

export default ActivityPageMainContent
