import React from 'react'
import { Text, View } from 'react-native'
import MailboxSvg from '@/components/svg/MailboxSvg'
import { fontFamily } from '@/constants/Fonts'

const CheckSpam = () => {
	return (
		<View className="flex-row justify-center items-center gap-[8px]">
			<MailboxSvg />
			<Text className="text-base text-gray-9a" style={{ fontFamily: fontFamily.medium }}>
				Не получили код? Проверьте спам
			</Text>
		</View>
	)
}

export default CheckSpam
