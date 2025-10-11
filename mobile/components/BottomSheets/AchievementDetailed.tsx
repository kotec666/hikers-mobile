import React from 'react'
import { Text, View } from 'react-native'
import { Colors } from '@/constants/Colors'
import AchievementsMedalSvg from '@/components/svg/AchievementsMedalSvg'
import { fontFamily } from '@/constants/Fonts'

const AchievementDetailed = () => {
	return (
		<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center gap-[20px]]">
				<View className="p-[16px]" style={{ backgroundColor: Colors['purple-87'], borderRadius: 16 }}>
					<AchievementsMedalSvg width={43} height={43} />
				</View>
				<View className="items-center mt-[15px]">
					<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
						Очень много спал
					</Text>
					<Text style={{ fontFamily: fontFamily.medium }} className="text-gray-ab text-xs">
						Есть у 3.34% пользователей
					</Text>
				</View>
			</View>
		</View>
	)
}

export default AchievementDetailed
