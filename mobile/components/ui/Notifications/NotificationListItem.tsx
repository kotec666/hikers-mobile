import { View, Text, Pressable } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { fontFamily } from '@/constants/Fonts'
import { cn } from '@/helpers/cn'
import { INotification } from '@/api/notifications'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { NotificationType } from '@shared/enums'
import { Href } from 'expo-router'

interface INotificationListItemProps {
	className?: string
	notification: INotification
}

export const handleRedirectOnPageWhenNotificationPressed = (
	notificationType: NotificationType,
	relEntityId: string | null
) => {
	let redirectLink: null | Href = null

	switch (notificationType) {
		case NotificationType.FRIEND_INVITE:
			redirectLink = `/user/profile/${relEntityId}`
			break
		case NotificationType.TAGGED_IN_POST:
			redirectLink = `/posts/${relEntityId}`
			break
		case NotificationType.ACHIEVEMENT:
			redirectLink = '/achievements'
			break
		case NotificationType.TRAINING_INVITE:
			redirectLink = `/(tabs)/newTraining?invited=1234567890` // @TODO
			break
	}
	return redirectLink
}

export function NotificationListItem(props: INotificationListItemProps) {
	const { push } = useSafeNavigation()

	const redirectLink = handleRedirectOnPageWhenNotificationPressed(
		props.notification.type,
		props.notification.action.relEntityId
	)
	return (
		<Pressable
			onPress={() => (redirectLink ? push(redirectLink) : undefined)}
			className={cn('flex-row gap-4 items-center', props.className)}
		>
			<UserAvatar
				avatar={
					props.notification.action.iconFilename
						? `${PATH_TO_IMAGE}${props.notification.action.iconFilename}`
						: null
				}
			/>
			<Text
				className="text-gray-ab text-base"
				numberOfLines={3}
				ellipsizeMode="tail"
				style={{ flexGrow: 1, flexShrink: 1, fontFamily: fontFamily.medium }}
			>
				{props.notification.action.text}
			</Text>
			{props.notification.readedAt ? null : <View className="bg-white h-[9px] w-[9px] rounded-full ml-2" />}
		</Pressable>
	)
}
