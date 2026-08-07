import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

const AllowDeniedGeolocation = (props: { allow: () => void; close: () => void }) => {
	const { t } = useTranslation()
	return (
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
					{t('WorkoutPage.bottomSheets.deniedGeolocation.title')}
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
					{t('WorkoutPage.bottomSheets.deniedGeolocation.description')}
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.allow}>
					{t('WorkoutPage.bottomSheets.actions.openSettings')}
				</Button>
				<Button variant="transparent" onPress={props.close}>
					{t('WorkoutPage.bottomSheets.actions.notNow')}
				</Button>
			</View>
		</View>
	)
}

export default AllowDeniedGeolocation
