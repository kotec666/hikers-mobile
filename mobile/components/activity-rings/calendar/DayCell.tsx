import { CalendarDay } from '@/helpers/calendar'
import { Pressable, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import SimpleRing from '@/components/activity-rings/SimpleRing'
import { memo } from 'react'
import { isToday } from 'date-fns'

interface DayCellProps {
	item: CalendarDay
	onPress: () => void
}

const DayCell = memo(({ item, onPress }: DayCellProps) => {
	const isCurrentDay = isToday(item.date)

	return (
		<Pressable onPress={onPress} className="items-center mb-5">
			<View className="relative">
				<Text
					className="text-white mb-2"
					style={{
						fontSize: 13,
						fontFamily: fontFamily.medium
					}}
				>
					{item.dayNumber}
				</Text>
				{isCurrentDay && (
					<View className="absolute top-0 -right-[10px] w-[5.5px] h-[5.5px] rotate-45 bg-green-main rounded-[1px]" />
				)}
			</View>
			<SimpleRing progress={50} />
		</Pressable>
	)
})

DayCell.displayName = 'DayCell'

export default DayCell
