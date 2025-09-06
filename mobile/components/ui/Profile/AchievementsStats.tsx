import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

const AchievementsStats = () => {
	return (
		<View className="bg-black-25 rounded-[15px] flex-1 justify-center items-center" style={{ paddingVertical: 20 }}>
			<Text className="text-xs  text-white" style={{ fontFamily: fontFamily.bold }}>
				Прыгнул выше всех
			</Text>
		</View>
	)
}

export default AchievementsStats
