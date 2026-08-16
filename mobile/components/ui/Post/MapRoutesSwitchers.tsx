import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import EyeSvg from '@/components/svg/EyeSvg'
import { Colors } from '@/constants/Colors'
import { useTranslation } from 'react-i18next'

const MapRoutesSwitchers = () => {
	const { t } = useTranslation()

	return (
		<View className="gap-[10px]">
			<View className="flex-row gap-[8px] items-center">
				<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
					{t('PostDetailsPage.authorRoute')}
				</Text>
				<EyeSvg opened color={Colors['green-main']} />
			</View>
			<View className="flex-row gap-[8px] items-center">
				<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
					{t('PostDetailsPage.allRoutes')}
				</Text>
				<EyeSvg opened={false} color={Colors['orange-main']} />
				<EyeSvg opened color={Colors['blue-00']} />
			</View>
		</View>
	)
}

export default MapRoutesSwitchers
