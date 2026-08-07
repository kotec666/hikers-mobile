import React from 'react'
import { View, Text, ScrollView } from 'react-native'
import { Rings } from '@/components/activity-rings/Rings'
import { fontFamily } from '@/constants/Fonts'
import PopupMenu from '@/components/ui/Popup/PopupMenu'
import { Motion } from '@legendapp/motion'
import RoundedPlusMinusSvg from '@/components/svg/RoundedPlusMinusSvg'
import PopupMenuItem from '@/components/ui/Popup/PopupMenuItem'
import CircleSvg from '@/components/svg/CircleSvg'
import CalendarSvg from '@/components/svg/CalendarSvg'
import { MetricContainer } from '@/components/activity-rings/MetricContainer'
import FootprintsSvg from '@/components/svg/FootprintsSvg'
import DistanceSvg from '@/components/svg/DistanceSvg'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

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
							<PopupMenu
								menuWidth={260}
								menuHeight={150}
								trigger={({ open }) => (
									<Motion.Pressable
										onPress={open}
										className="bg-gray-1c w-[40px] h-[40px] rounded-full items-center justify-center"
									>
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
									</Motion.Pressable>
								)}
							>
								<PopupMenuItem onPress={handlePressChangeGoalToday}>
									<View className="flex-row items-center gap-3">
										<CircleSvg />
										<Text className="text-white text-base">
											{t('DailyActivity.changeGoalToday')}
										</Text>
									</View>
								</PopupMenuItem>
								<PopupMenuItem onPress={handlePressChangeGoalSchedule}>
									<View className="flex-row items-center gap-3">
										<CalendarSvg />
										<Text className="text-white text-base">
											{t('DailyActivity.changeSchedule')}
										</Text>
									</View>
								</PopupMenuItem>
							</PopupMenu>
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
