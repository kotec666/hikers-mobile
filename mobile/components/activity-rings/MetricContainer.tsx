import React from 'react'
import { View, Text } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Colors } from '@/constants/Colors'

export const MetricContainer = ({
	title,
	value,
	icon
}: {
	icon?: React.JSX.Element
	title: string
	value?: string
}) => {
	return (
		<View
			className="flex-1  gap-2 bg-gray-1c rounded-2xl items-center justify-center w-full"
			style={{ paddingVertical: 16 }}
		>
			{icon}
			<Text className="text-white" style={{ fontSize: 16, fontFamily: fontFamily.regular }}>
				{value}
			</Text>
			<Text
				className="text-sm "
				style={{ color: Colors['gray-a1'], fontSize: 14, fontFamily: fontFamily.medium }}
			>
				{title}
			</Text>
		</View>
	)
}
