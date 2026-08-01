import React, { useRef, useState } from 'react'
import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { CalendarHeader } from '@/components/activity-rings/calendar/CalendarHeader'
import { MonthSection } from '@/components/activity-rings/calendar/MonthSection'
import { CalendarMonth } from '@/helpers/calendar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { FlashList, FlashListRef } from '@shopify/flash-list'

interface IProps {
	months: CalendarMonth[]
	currentMonthIndex: number
	onLoadMore: () => void
	isVisible: boolean
}

const HORIZONTAL_PADDING = 3 // px-3 * 2 сторон уже учтено ниже

const ActivityGoalPerMonth = ({ months, currentMonthIndex, onLoadMore, isVisible }: IProps) => {
	const [visibleMonth, setVisibleMonth] = useState(months[0].title)
	const listRef = useRef<FlashListRef<CalendarMonth>>(null)
	const insets = useSafeAreaInsets()

	const { width, height } = useWindowDimensions()
	const containerWidth = width - HORIZONTAL_PADDING * 2

	const getProgress = (_date: Date) => 50 // ваша реальная функция получения прогресса за день

	return (
		<View
			className="flex-1"
			pointerEvents={isVisible ? 'auto' : 'none'}
			style={{
				...StyleSheet.absoluteFill,
				opacity: isVisible ? 1 : 0
			}}
		>
			<CalendarHeader title={visibleMonth} containerWidth={containerWidth} />

			<FlashList
				ref={listRef}
				style={{ flex: 1 }}
				data={months}
				initialScrollIndex={currentMonthIndex}
				onStartReached={onLoadMore}
				onStartReachedThreshold={1}
				renderItem={({ item }) => (
					<MonthSection month={item} containerWidth={containerWidth} getProgress={getProgress} />
				)}
				keyExtractor={(item) => item.id}
				drawDistance={height}
				onViewableItemsChanged={({ viewableItems }) => {
					const first = viewableItems?.[0]

					if (first?.item?.title) {
						setVisibleMonth(first.item.title)
					}
				}}
				viewabilityConfig={{
					itemVisiblePercentThreshold: 60
				}}
				contentContainerStyle={{
					paddingBottom: insets.bottom + 40
				}}
			/>
		</View>
	)
}

export default ActivityGoalPerMonth
