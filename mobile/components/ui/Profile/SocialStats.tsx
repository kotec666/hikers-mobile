import React from 'react'
import { TouchableOpacity, View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { RelativePathString, useRouter } from 'expo-router'

interface IProps {
	label?: string
	hrefTo?: string
	content?: string | number
}

const InnerSocialStatsData = ({ label, content }: Pick<IProps, 'label' | 'content'>) => {
	return (
		<>
			<Text className="text-xs text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
				{label}
			</Text>
			<Text className="text-[19px] text-green-main" style={{ fontFamily: fontFamily.bold }}>
				{content}
			</Text>
		</>
	)
}

const SocialStats = ({ label, content, hrefTo }: IProps) => {
	const router = useRouter()

	if (hrefTo) {
		return (
			<TouchableOpacity
				onPress={() => router.push(hrefTo as RelativePathString)}
				className="bg-black-25 rounded-[15px] px-[15px] flex-1 py-[20px]"
			>
				<InnerSocialStatsData label={label} content={content} />
			</TouchableOpacity>
		)
	} else {
		return (
			<View className="bg-black-25 rounded-[15px] px-[15px] flex-1 py-[20px]">
				<InnerSocialStatsData label={label} content={content} />
			</View>
		)
	}
}

export default SocialStats
