import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

interface IProps {
	label: string
	text: string
}

const PostMetrics = (props: IProps) => {
	return (
		<View className="gap-[5px]">
			<Text className="text-gray-ab text-xs" style={{ fontFamily: fontFamily.medium }}>
				{props.label}
			</Text>
			<Text className="text-[23px] text-green-main" style={{ fontFamily: fontFamily.bold }}>
				{props.text}
			</Text>
		</View>
	)
}

export default PostMetrics
