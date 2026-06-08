import React from 'react'
import { View, Text, Pressable } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Link } from 'expo-router'
import { Rings } from '@/components/activity-rings/Rings'

const DailyActivityRedirect = () => {
	return (
		<Link href="/daily-activity/kcal" className="p-[16px] gap-4 bg-gray-1c rounded-2xl" asChild>
			<Pressable className="gap-4">
				<Text className="text-white text-lg" style={{ fontFamily: fontFamily.bold }}>
					Дневная активность
				</Text>
				<View className="flex-row justify-between items-center gap-8">
					<View>
						<Text className="text-white text-2xl" style={{ fontFamily: fontFamily.medium }}>
							Подвижность
						</Text>
						<Text className="text-green-main text-xl" style={{ fontFamily: fontFamily.bold }}>
							400/200 ККАЛ
						</Text>
					</View>
					<Rings circleSize={110} />
				</View>
			</Pressable>
		</Link>
	)
}

export default DailyActivityRedirect
