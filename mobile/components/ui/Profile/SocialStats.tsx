import React from 'react'
import { TouchableOpacity } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { RelativePathString, useRouter } from 'expo-router'
import { Box, Text } from '@/constants/Theme'

interface IProps {
	label?: string
	hrefTo?: string
	content?: string | number
}

const InnerSocialStatsData = ({ label, content }: Pick<IProps, 'label' | 'content'>) => {
	return (
		<>
			<Text className="text-xs" color="textSecondary" style={{ fontFamily: fontFamily.medium }}>
				{label}
			</Text>
			<Text className="text-[19px]" color="textSuccess" style={{ fontFamily: fontFamily.bold }}>
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
			<Box backgroundColor="cardBackground" className="rounded-[15px] px-[15px] flex-1 py-[20px]">
				<InnerSocialStatsData label={label} content={content} />
			</Box>
		)
	}
}

export default SocialStats
