import React from 'react'
import { fontFamily } from '@/constants/Fonts'
import RenderText from '@/components/ui/RenderText'
import { Button } from '@/components/ui/Button'
import { View } from 'react-native'
import { useRouter } from 'expo-router'

const PostsEmpty = () => {
	const router = useRouter()

	const textBlocks = [
		{
			text: 'К сожалению, постов еще не',
			className: 'text-gray-ab text-center text-[19px]',
			style: { fontFamily: fontFamily.regular }
		},
		{
			text: 'существует, опубликуйте пост',
			className: 'text-gray-ab text-center text-[19px]',
			style: { fontFamily: fontFamily.regular }
		},
		{
			text: 'после тренировки',
			className: 'text-gray-ab text-center text-[19px]',
			style: { fontFamily: fontFamily.regular }
		}
	]

	return (
		<View className="gap-[40px]">
			<RenderText textBlocks={textBlocks} />
			<Button onPress={() => router.push('/(tabs)/newTraining')} variant="white">
				Начать тренировку
			</Button>
		</View>
	)
}

export default PostsEmpty
