import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { WEEKDAY_I18N_KEYS } from '@/helpers/calendar'
import { useTranslation } from 'react-i18next'

interface CalendarHeaderProps {
	title: string
	containerWidth: number
}

export const CalendarHeader = ({ title, containerWidth }: CalendarHeaderProps) => {
	const { t } = useTranslation()

	return (
		<View className="pt-4 pb-3 gap-4">
			<Text
				className="text-white text-center"
				style={{
					fontSize: 18,
					fontFamily: fontFamily.bold
				}}
			>
				{title} {t('DailyActivity.yearShortSuffix')}
			</Text>
			<View
				style={{
					flexDirection: 'row',
					width: containerWidth,
					gap: 2
				}}
			>
				{WEEKDAY_I18N_KEYS.map((key) => (
					<View key={key} className="flex-1">
						<Text className="text-xs text-gray-ab text-center">
							{t(`DailyActivity.weekdaysShort.${key}`)}
						</Text>
					</View>
				))}
			</View>
		</View>
	)
}
