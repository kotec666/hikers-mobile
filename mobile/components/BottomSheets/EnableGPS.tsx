import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import { useTranslation } from 'react-i18next'

const EnableGps = (props: { allow: () => void; close: () => void }) => {
	const { t } = useTranslation()
	return (
		<View className="items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center">
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					{t('WorkoutPage.bottomSheets.enableGps.recordWorkouts')}
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					{t('WorkoutPage.bottomSheets.enableGps.switch')}
				</Text>
				<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg">
					{t('WorkoutPage.bottomSheets.enableGps.geo')}
				</Text>
				<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg">
					{t('WorkoutPage.bottomSheets.enableGps.doItNow')}
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.allow}>
					{t('common.yes')}
				</Button>
				<Button variant="transparent" onPress={props.close}>
					{t('common.cancel')}
				</Button>
			</View>
		</View>
	)
}

export default EnableGps
