import React from 'react'
import { Text, View } from 'react-native'
import MailboxSvg from '@/components/svg/MailboxSvg'
import { fontFamily } from '@/constants/Fonts'
import { useTranslation } from 'react-i18next'

const CheckSpam = () => {
	const { t } = useTranslation()

	return (
		<View className="flex-row justify-center items-center gap-[8px]">
			<MailboxSvg />
			<Text className="text-base text-gray-9a" style={{ fontFamily: fontFamily.medium }}>
				{t('AuthPage.mailConfirmation.checkSpam')}
			</Text>
		</View>
	)
}

export default CheckSpam
