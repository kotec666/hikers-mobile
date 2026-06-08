import { View, Text } from 'react-native'
import { CalendarMonth } from '@/helpers/calendar'
import DayCell from '@/components/activity-rings/calendar/DayCell'
import { fontFamily } from '@/constants/Fonts'

interface MonthSectionProps {
	month: CalendarMonth
}

export const MonthSection = ({ month }: MonthSectionProps) => {
	return (
		<View
			style={{
				paddingTop: 12
			}}
		>
			<Text
				className="text-white px-4 mb-5"
				style={{
					fontSize: 22,
					fontFamily: fontFamily.bold
				}}
			>
				{month.title}
			</Text>
			<View
				className="px-3 w-full"
				style={{
					flexDirection: 'row',
					flexWrap: 'wrap'
					// justifyContent: 'space-between'
				}}
			>
				{Array.from({
					length: month.startOffset
				}).map((_, index) => (
					<View
						key={`empty-${index}`}
						style={{
							width: '14.285%',
							marginBottom: 18
						}}
					/>
				))}

				{month.days.map((day) => (
					<View
						key={day.date.toISOString()}
						style={{
							width: '14.285%'
						}}
					>
						<DayCell item={day} onPress={() => console.log(day.date)} />
					</View>
				))}
			</View>
		</View>
	)
}
