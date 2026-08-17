import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import NotificationsPermissionSvg from '@/components/svg/NotificationsPermissionSvg'
import { useTranslation } from 'react-i18next'

const AllowNotifications = (props: { allow: () => void; close: () => void }) => {
	const { t } = useTranslation()
	return (
		<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center gap-[20px]">
				<NotificationsPermissionSvg width={36} height={36} />
				<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg text-center">
					{t('WorkoutPage.bottomSheets.notifications.title')}
				</Text>
			</View>
			<View className="gap-[10px]">
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

export default AllowNotifications
