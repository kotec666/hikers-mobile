import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { WEEK_DAYS } from '@/constants/Variables'

interface CalendarHeaderProps {
	title: string
	containerWidth: number
}

export const CalendarHeader = ({ title, containerWidth }: CalendarHeaderProps) => {
	return (
		<View className="pt-4 pb-3 gap-4">
			<Text
				className="text-white text-center"
				style={{
					fontSize: 18,
					fontFamily: fontFamily.bold
				}}
			>
				{title} г.
			</Text>
			<View
				style={{
					flexDirection: 'row',
					width: containerWidth,
					gap: 2
				}}
			>
				{WEEK_DAYS.map((day) => (
					<View key={day} className="flex-1">
						<Text className="text-xs text-gray-ab text-center">{day}</Text>
					</View>
				))}
			</View>
		</View>
	)
}
