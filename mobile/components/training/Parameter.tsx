import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

const Parameter = (props: { label: string; value: string | number; isPaused?: boolean }) => {
	return (
		<View style={{ opacity: props.isPaused ? 0.5 : 1 }}>
			<Text className="text-gray-ab text-base" style={{ fontFamily: fontFamily.medium }}>
				{props.label}
			</Text>
			<Text className="text-green-main text-[29px]" style={{ fontFamily: fontFamily.bold }}>
				{props.value}
			</Text>
		</View>
	)
}

export default Parameter
