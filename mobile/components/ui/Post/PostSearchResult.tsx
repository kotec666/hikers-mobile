import React from 'react'
import { View, Text } from 'react-native'
import PeopleRunningSvg from '@/components/svg/PeopleRunningSvg'
import { fontFamily } from '@/constants/Fonts'
import { Link } from 'expo-router'

const PostSearchResult = (props: { index: number }) => {
	return (
		<Link href="/">
			<View className="flex-row items-center w-full justify-between">
				<View className="flex-row items-center gap-[15px]">
					<View className="w-[50px] h-[50px] rounded-[15px] bg-white items-center justify-center">
						<PeopleRunningSvg width={26} height={26} />
					</View>
					<Text className="text-base text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
						Я сегодня пробежал 2 ... idx:({props.index + 1})
					</Text>
				</View>
				<Text className="text-xs text-gray-ab" style={{ fontFamily: fontFamily.regular }}>
					Сегодня
				</Text>
			</View>
		</Link>
	)
}

export default PostSearchResult
