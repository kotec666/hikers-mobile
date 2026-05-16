import { View } from 'react-native'
import NotificationsBellSvg from '@/components/svg/NotificationsBellSvg'
import { Motion } from '@legendapp/motion'
import { checkIsUnreadNotificationsExists } from '@/api/notifications'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { useQuery } from '@tanstack/react-query'

export function NotificationsButton() {
	const { push } = useSafeNavigation()

	const { data } = useQuery({
		queryKey: ['unread-exists'],
		queryFn: async () => {
			try {
				const result = await checkIsUnreadNotificationsExists()
				return result.exists
			} catch (e) {
				await getFieldsErrors(e)
				throw e
			}
		}
	})

	const haveUnread = !!data

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
