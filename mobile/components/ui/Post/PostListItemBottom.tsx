import { fontFamily } from '@/constants/Fonts'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import LikeSvg from '@/components/svg/LikeSvg'
import ShareSvg from '@/components/svg/ShareSvg'
import { useRouter } from 'expo-router'

const PostListItemBottom = () => {
	const participants = [
		{ id: 1, avatar: false },
		{ id: 2, avatar: true },
		{ id: 3, avatar: false }
	]

	const router = useRouter()
	return (
		<View className="flex-row justify-between items-center">
			<TouchableOpacity onPress={() => router.push('/news-feed/members')}>
				<View className="flex-row items-center gap-[15px]">
					<View className="flex-row">
						{participants.map((p, index) => (
							<View
								key={p.id}
								style={{
									marginLeft: index === 0 ? 0 : -10,
									zIndex: participants.length - index
								}}
							>
								<UserAvatar avatar={p.avatar} style={{ width: 35, height: 35 }} />
							</View>
						))}
					</View>

					<View className="flex-row gap-[5px]">
						<Text className="text-blue-3d text-sm" style={{ fontFamily: fontFamily.medium }}>
							Стив
						</Text>
						<Text className="text-gray-ab text-sm" style={{ fontFamily: fontFamily.medium }}>
							и ещё
						</Text>
						<Text className="text-blue-3d text-sm" style={{ fontFamily: fontFamily.medium }}>
							2
						</Text>
					</View>
				</View>
			</TouchableOpacity>

			<View className="flex-row gap-[15px]">
				<View className="flex-row gap-[8px] items-center">
					<LikeSvg isPressed />
					<Text className="text-white text-sm" style={{ fontFamily: fontFamily.medium }}>
						205
					</Text>
				</View>
				<View className="items-center justify-center">
					<ShareSvg />
				</View>
			</View>
		</View>
	)
}

export default PostListItemBottom
