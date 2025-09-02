import React from 'react'
import { Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import PostMetrics from '@/components/ui/Post/PostMetrics'
import PostListItemSlider from '@/components/ui/Post/PostListItemSlider'

const PostListItemBody = () => {
	const PostSliderItems = [
		{ id: 1, image: require('@/assets/images/carousel/carousel-2.webp') },
		{ id: 2, image: require('@/assets/images/carousel/carousel-2.webp') },
		{ id: 3, image: require('@/assets/images/carousel/carousel-2.webp') }
	]

	return (
		<>
			<View className="gap-[6px] mt-[10px]">
				<Text className="text-gray-ab text-[19px]" style={{ fontFamily: fontFamily.bold }}>
					Нормальный заголовок
				</Text>
				<Text className="text-gray-ab text-base" style={{ fontFamily: fontFamily.medium }}>
					Я сегодня пробежал 2 метра и упал. Хочу вам похвастаться. Это было не то, на что я надеялся. Я
					остановился, обессиленный и разочарованный Не знаю, что произошло, но вместо того, чтобы сдаться, я
					вернулся в квартиру, выпил воды и задумался над тем, чтобы начать бежать снова.
				</Text>
			</View>

			<View className="flex-row justify-between">
				<PostMetrics label="Расстояние" text="52 км" />
				<PostMetrics label="Время" text="100 мин" />
				<PostMetrics label="Набор высоты" text="140 м" />
			</View>

			<View>
				<PostListItemSlider data={PostSliderItems} />
			</View>
		</>
	)
}

export default PostListItemBody
