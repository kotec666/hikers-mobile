import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { Button } from '@/components/ui/Button'
import NotificationsPermissionSvg from '@/components/svg/NotificationsPermissionSvg'

const AllowDeniedNotifications = (props: { allow: () => void; close: () => void }) => {
	return (
		<View className="flex-1 items-center justify-start p-[16px] gap-[40px] w-full">
			<View className="items-center gap-[20px]">
				<NotificationsPermissionSvg width={36} height={36} />
				<View className="items-center">
					<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
						Без разрешения пуш-уведомлений
					</Text>
					<Text style={{ fontFamily: fontFamily.regular }} className="text-white text-lg text-center">
						начать тренировку не получится
					</Text>
				</View>
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

export default AllowDeniedNotifications
