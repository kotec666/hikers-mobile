import { View } from 'react-native'
import NotificationsBellSvg from '@/components/svg/NotificationsBellSvg'

export function NotificationsButton() {
	return (
		<View className="border-2 relative rounded-full h-[50px] w-[50px] border-black-44 justify-center items-center">
			<View className="absolute bg-green-main h-[9px] w-[9px] rounded-full top-0 right-[4px]" />
			<NotificationsBellSvg />
		</View>
	)
}
