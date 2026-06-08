import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { WEEK_DAYS } from '@/constants/Variables'

interface CalendarHeaderProps {
	title: string
}

export const CalendarHeader = ({ title }: CalendarHeaderProps) => {
	return (
		<View className="px-4 pt-4 pb-3 gap-4">
			<Text
				className="text-white text-center"
				style={{
					fontSize: 18,
					fontFamily: fontFamily.bold
				}}
			>
				{title} г.
			</Text>
			<View className="flex-row gap-2">
				{WEEK_DAYS.map((day) => (
					<View key={day} className="flex-1">
						<Text className="text-xs text-gray-ab text-center">{day}</Text>
					</View>
				))}
			</View>
		</View>
	)
}
