import React from 'react'
import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

const SocialStats = () => {
	return (
		<View className="bg-black-25 rounded-[15px] px-[15px] flex-1" style={{ paddingVertical: 10 }}>
			<Text className="text-xs text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
				Подписчики
			</Text>
			<Text className="text-[19px] text-green-main" style={{ fontFamily: fontFamily.bold }}>
				600
			</Text>
		</View>
	)
}

export default SocialStats
