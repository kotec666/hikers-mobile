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
			redirectLink = `/achievements?id=${relEntityId}`
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

	const parseTextWithMentions = (text: string) => {
		const regex = /(@[^\s]+)/g
		const parts = text.split(regex)

		return parts.map((part, index) => {
			if (part.match(regex)) {
				return {
					type: 'mention',
					value: part,
					key: index
				}
			}
			return {
				type: 'text',
				value: part,
				key: index
			}
		})
	}
	return (
		<Pressable
			onPress={() => (redirectLink ? push(redirectLink) : undefined)}
			className={cn('flex-row gap-4 items-center bg-black-0d px-[16px]', props.className)}
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
				{parseTextWithMentions(props.notification.action.text).map((part) => {
					if (part.type === 'mention') {
						return (
							<Text key={part.key} className="text-gray-d5" style={{ fontFamily: fontFamily.bold }}>
								{part.value}
							</Text>
						)
					}

					return <Text key={part.key}>{part.value}</Text>
				})}
			</Text>
			{props.notification.readedAt ? null : <View className="bg-white h-[9px] w-[9px] rounded-full ml-2" />}
		</Pressable>
	)
}
