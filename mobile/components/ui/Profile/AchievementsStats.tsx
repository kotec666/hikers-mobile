import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

const AchievementsStats = (props: { title: string }) => {
	return (
		<View
			className="bg-black-25 rounded-[15px] flex-1 justify-center items-center py-[20px] min-h-[63px]"
			style={{ paddingVertical: 20 }}
		>
			<Text className="text-center text-[12px] text-white" style={{ fontFamily: fontFamily.bold }}>
				{props.title}
			</Text>
		</View>
	)
}

export default AchievementsStats
