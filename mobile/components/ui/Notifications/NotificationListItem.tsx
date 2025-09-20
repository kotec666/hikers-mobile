import { View, Text } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { fontFamily } from '@/constants/Fonts'

export function NotificationListItem() {
	return (
		<View className="flex-row gap-4 items-center">
			<UserAvatar avatar />
			<Text style={{ flexShrink: 1 }}>
				<Text className="text-gray-ab text-base mr-1" style={{ fontFamily: fontFamily.medium }}>
					Пользователь{' '}
				</Text>
				<Text className="text-gray-d5 mr-1" style={{ fontFamily: fontFamily.medium }}>
					@oxxysergey
				</Text>
				<Text className="text-gray-ab text-base flex-1 flex-shrink" style={{ fontFamily: fontFamily.medium }}>
					{' '}
					пригласил вас на тренировку
				</Text>
			</Text>
			<View className="bg-white h-[9px] w-[9px] rounded-full ml-2" />
		</View>
	)
}
