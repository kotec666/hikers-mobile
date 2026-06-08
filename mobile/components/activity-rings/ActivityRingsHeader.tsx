import React from 'react'
import { DEFAULT_PADDING_TOP } from '@/constants/Variables'
import { Pressable, Text, View } from 'react-native'
import { RoundedButton } from '@/components/ui/HeaderBack'
import { fontFamily } from '@/constants/Fonts'
import { formatHeaderDate, getWeek, TODAY } from '@/helpers/date'
import CalendarSvg from '@/components/svg/CalendarSvg'
import PagerView from 'react-native-pager-view'
import { addWeeks, format, isAfter, isSameDay } from 'date-fns'
import { ru } from 'date-fns/locale'
import { Rings } from '@/components/activity-rings/Rings'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { capitalizeFirstLetter } from '@/helpers/capitalizeFirstLetter'

interface IProps {
	selectedDate: Date
	canSwipeNextWeek: boolean
	handlePressHeaderCalendar: () => void
	setSelectedDate: (date: Date) => void
	weekPagerRef: React.RefObject<PagerView | null>
	handleWeekPageSelected: (e: any) => void
}

const ActivityRingsHeader = ({
	selectedDate,
	canSwipeNextWeek,
	handlePressHeaderCalendar,
	weekPagerRef,
	handleWeekPageSelected,
	setSelectedDate
}: IProps) => {
	const router = useRouter()
	const insets = useSafeAreaInsets()

	const handlePressGoBack = () => {
		return router.back()
	}

	const renderWeekPage = (offset: number) => {
		const days = getWeek(addWeeks(selectedDate, offset))

		return (
			<View key={offset} collapsable={false} className="flex-row justify-between px-[5px]">
				{days.map((date) => {
					const isSelected = isSameDay(date, selectedDate)
					const isToday = isSameDay(date, TODAY)
					const isPastSelected = isSelected && !isToday
					const isTodaySelected = isSelected && isToday
					const isFuture = isAfter(date, TODAY)

					return (
						<Pressable
							key={date.toISOString()}
							onPress={() => {
								if (isAfter(date, TODAY)) return

								setSelectedDate(date)
							}}
							className="justify-center items-center gap-2"
						>
							<View
								style={{
									width: 24,
									height: 24,
									justifyContent: 'center',
									alignItems: 'center',
									backgroundColor: isTodaySelected
										? 'rgba(34, 203, 90, 0.2)'
										: isPastSelected
											? 'rgba(161, 161, 161, 0.2)'
											: 'transparent',
									opacity: isFuture ? 0.4 : 1,
									borderRadius: 12,
									overflow: 'hidden'
								}}
							>
								<Text
									className="text-gray-ab"
									style={{
										fontSize: 12,
										fontFamily: fontFamily.medium
									}}
								>
									{capitalizeFirstLetter(
										format(date, 'EEEEEE', {
											locale: ru
										})
									)}
								</Text>
							</View>

							<Rings circleSize={40} />
						</Pressable>
					)
				})}
			</View>
		)
	}

	const renderEmptyPage = (key: string) => <View key={key} style={{ flex: 1 }} />

	return (
		<View
			className="gap-4 px-[16px]"
			style={{
				paddingTop: DEFAULT_PADDING_TOP + insets.top,
				paddingBottom: 12
			}}
		>
			<View className="flex-row items-center justify-between">
				<RoundedButton onPress={handlePressGoBack} />
				<Text className="text-white text-base" style={{ fontFamily: fontFamily.medium }}>
					{formatHeaderDate(selectedDate)}
				</Text>
				<RoundedButton onPress={handlePressHeaderCalendar} icon={<CalendarSvg />} />
			</View>
			<PagerView
				ref={weekPagerRef}
				style={{ height: 90 }}
				initialPage={1}
				onPageSelected={handleWeekPageSelected}
				scrollEnabled
			>
				{renderWeekPage(-1)}
				{renderWeekPage(0)}
				{canSwipeNextWeek ? renderWeekPage(1) : renderEmptyPage('next')}
			</PagerView>
		</View>
	)
}

export default ActivityRingsHeader
