import React from 'react'
import AlertCircleSvg from '@/components/svg/AlertCircleSvg'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'

const ErrorMessageIcon = ({ errorText }: { errorText?: string | boolean }) => {
	return (
		<View className="flex-row items-center gap-[8px]">
			<AlertCircleSvg />
			<Text className="text-base text-red-ff4" style={{ fontFamily: fontFamily.medium }}>
				{errorText}
			</Text>
		</View>
	)
}

export default ErrorMessageIcon
