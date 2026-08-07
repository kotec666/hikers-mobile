import React from 'react'
import { Text, View } from 'react-native'
import GeolocationPermissionSvg from '@/components/svg/GeolocationPermissionSvg'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

const AllowBackgroundGeolocation = (props: { allow: () => void; close: () => void }) => {
	const { t } = useTranslation()
	return (
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center gap-[20px]">
				<GeolocationPermissionSvg />
				<View className="items-center">
					<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
						{t('WorkoutPage.bottomSheets.geolocation.title')}
					</Text>
					<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
						{t('WorkoutPage.bottomSheets.geolocation.inBackgroundMode')}
					</Text>
				</View>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.allow}>
					{t('WorkoutPage.bottomSheets.actions.allow')}
				</Button>
				<Button variant="transparent" onPress={props.close}>
					{t('WorkoutPage.bottomSheets.actions.notNow')}
				</Button>
			</View>
		</View>
	)
}

export default AllowBackgroundGeolocation
