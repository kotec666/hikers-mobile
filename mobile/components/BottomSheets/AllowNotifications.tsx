import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import NotificationsPermissionSvg from '@/components/svg/NotificationsPermissionSvg'

const AllowNotifications = (props: { allow: () => void; close: () => void }) => {
	return (
		<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center gap-[20px]">
				<NotificationsPermissionSvg width={36} height={36} />
				<Text style={{ fontFamily: fontFamily.bold }} className="text-white text-lg text-center">
					Разрешите доступ к отправке пуш-уведомлений
				</Text>
			</View>
			<View className="w-full gap-[10px]">
				<Button variant="white" onPress={props.allow}>
					Разрешить
				</Button>
				<Button variant="transparent" onPress={props.close}>
					Не сейчас
				</Button>
			</View>
		</View>
	)
}

export default AllowNotifications
