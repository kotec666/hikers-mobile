import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Link } from 'expo-router'
import { Rings } from '@/components/activity-rings/Rings'
import { useTranslation } from 'react-i18next'

const DailyActivityRedirect = () => {
	const { t } = useTranslation()

	return (
		<Link href="/daily-activity/kcal" className="p-[16px] gap-4 bg-gray-1c rounded-2xl" asChild>
			<Pressable className="gap-4">
				<Text className="text-white text-lg" style={{ fontFamily: fontFamily.bold }}>
					{t('ProfilePage.dailyActivity.title')}
				</Text>
				<View className="flex-row justify-between items-center gap-8">
					<View>
						<Text className="text-white text-2xl" style={{ fontFamily: fontFamily.medium }}>
							{t('ProfilePage.dailyActivity.mobility')}
						</Text>
						<Text className="text-green-main text-xl" style={{ fontFamily: fontFamily.bold }}>
							400/200 {t('measurementUnits.kcal').toUpperCase()}
						</Text>
					</View>
					<Rings circleSize={110} />
				</View>
			</Pressable>
		</Link>
	)
}

export default DailyActivityRedirect
