import { View } from 'react-native'
import NotificationsBellSvg from '@/components/svg/NotificationsBellSvg'
import { Motion } from '@legendapp/motion'

export function NotificationsButton() {
	return (
		<Motion.Pressable>
			<Motion.View
				className="border-2 relative rounded-full h-[50px] w-[50px] border-black-44 justify-center items-center"
				whileTap={{ scale: 0.8 }}
				transition={{
					type: 'spring',
					damping: 20,
					stiffness: 400
				}}
			>
				<View className="absolute bg-green-main h-[9px] w-[9px] rounded-full top-0 right-[4px]" />
				<NotificationsBellSvg />
			</Motion.View>
		</Motion.Pressable>
	)
}
