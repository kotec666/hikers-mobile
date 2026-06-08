import React, { useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { CalendarHeader } from '@/components/activity-rings/calendar/CalendarHeader'
import { LegendList, LegendListRef } from '@legendapp/list'
import { MonthSection } from '@/components/activity-rings/calendar/MonthSection'
import { CalendarMonth } from '@/helpers/calendar'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

interface IProps {
	months: CalendarMonth[]
	currentMonthIndex: number
	onLoadMore: () => void
	isVisible: boolean
}

const ActivityGoalPerMonth = ({ months, currentMonthIndex, onLoadMore, isVisible }: IProps) => {
	const [visibleMonth, setVisibleMonth] = useState(months[0].title)
	const listRef = useRef<LegendListRef>(null)
	const insets = useSafeAreaInsets()

	return (
		<View
			className="flex-1"
			pointerEvents={isVisible ? 'auto' : 'none'}
			style={{
				...StyleSheet.absoluteFill,
				opacity: isVisible ? 1 : 0
			}}
		>
			<CalendarHeader title={visibleMonth} />

			<LegendList
				ref={listRef}
				style={{ flex: 1 }}
				data={months}
				initialScrollIndex={currentMonthIndex}
				onStartReached={onLoadMore}
				onStartReachedThreshold={1}
				maintainVisibleContentPosition
				renderItem={({ item }) => <MonthSection month={item} />}
				keyExtractor={(item) => item.id}
				estimatedItemSize={500}
				recycleItems
				drawDistance={500}
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
