import { fontFamily } from '@/constants/Fonts'
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import LikeSvg from '@/components/svg/LikeSvg'
import ShareSvg from '@/components/svg/ShareSvg'
import { useRouter } from 'expo-router'
import { Colors } from '@/constants/Colors'

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
									zIndex: participants.length - index,
									shadowColor: Colors['green-main'],
									shadowOffset: {
										width: 0,
										height: 1
									},
									shadowOpacity: 0.2,
									shadowRadius: 1.5,
									elevation: 2
								}}
								className="bg-white rounded-full shadow-sm"
							>
								<UserAvatar avatar={p.avatar} style={{ width: 35, height: 35 }} bordered />
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
