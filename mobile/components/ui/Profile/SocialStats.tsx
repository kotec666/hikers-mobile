import React from 'react'
import { Text, TouchableOpacity } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { RelativePathString, useRouter } from 'expo-router'

const SocialStats = ({ label, content, hrefTo }: { label?: string; hrefTo: string; content?: string | number }) => {
	const router = useRouter()

	return (
		<TouchableOpacity
			onPress={() => router.push(hrefTo as RelativePathString)}
			className="bg-black-25 rounded-[15px] px-[15px] flex-1 py-[20px]"
		>
			<Text className="text-xs text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
				{label}
			</Text>
			<Text className="text-[19px] text-green-main" style={{ fontFamily: fontFamily.bold }}>
				{content}
			</Text>
		</TouchableOpacity>
	)
}

export default SocialStats
