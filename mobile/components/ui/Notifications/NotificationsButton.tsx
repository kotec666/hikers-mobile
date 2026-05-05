import { View } from 'react-native'
import { Motion } from '@legendapp/motion'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useUnreadNotificationsQuery } from '@/queries/notifications'
import NotificationsBellSvg from '@/components/svg/NotificationsBellSvg'

export function NotificationsButton() {
	const { push } = useSafeNavigation()

	const { data } = useUnreadNotificationsQuery()
	const haveUnread = data?.exists

	const toNotificationsPage = () => {
		return push('/notifications')
	}
	return (
		<Motion.Pressable onPress={toNotificationsPage}>
			<Motion.View
				className="border relative rounded-full h-[50px] w-[50px] border-black-44 justify-center items-center"
				whileTap={{ scale: 0.8 }}
				transition={{
					type: 'spring',
					damping: 20,
					stiffness: 400
				}}
			>
				{haveUnread && (
					<View className="absolute bg-green-main h-[9px] w-[9px] rounded-full top-0 right-[4px]" />
				)}
				<NotificationsBellSvg />
			</Motion.View>
		</Motion.Pressable>
	)
}
