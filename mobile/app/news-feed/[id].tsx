import React, { useState } from 'react'
import { View, ScrollView, Image, Dimensions } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import { StatusBar } from 'expo-status-bar'
import PostListItemHeader from '@/components/ui/Post/PostListItemHeader'
import HeaderBack from '@/components/ui/HeaderBack'
import PostBodyWrapper, { PostType } from '@/components/ui/Post/PostBodyWrapper'
import PostListItemBottom from '@/components/ui/Post/PostListItemBottom'
import PostListItemSlider from '@/components/ui/Post/PostListItemSlider'
import MapRoutesSwitchers from '@/components/ui/Post/MapRoutesSwitchers'
import DeletePostModal from '@/components/ui/Post/DeletePostModal'
import MoreOptionsSvg from '@/components/svg/MoreOptionsSvg'
import MoreOptionsButton from '@/components/ui/MoreOptionsButton/MoreOptionsButton'

const { height } = Dimensions.get('screen')

const Post = () => {
	const insets = useSafeAreaInsets()
	const [state, setState] = useState({
		isDeleteModalOpen: false
	})

	const PostSliderItems = [
		{ id: 1, image: require('@/assets/images/carousel/carousel-3.webp') },
		{ id: 2, image: require('@/assets/images/carousel/carousel-3.webp') },
		{ id: 3, image: require('@/assets/images/carousel/carousel-3.webp') }
	]

	const SLIDE_ASPECT_RATIO = height / 3.6

	const handleClickDelete = () => {
		return setState((s) => ({ ...s, isDeleteModalOpen: !s.isDeleteModalOpen }))
	}

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1, alignItems: 'center' }}>
				<DeletePostModal open={state.isDeleteModalOpen} handleClose={handleClickDelete} />
				<Container className="gap-[20px]">
					<View className="flex-row justify-between items-center">
						<HeaderBack>Просмотр поста</HeaderBack>
						<MoreOptionsButton
							icon={<MoreOptionsSvg />}
							params={[
								{ label: 'Редактировать профиль', action: () => {} },
								{ label: 'Политика конфиденциальности', action: () => {} },
								{ label: 'Политика обработки персональных данных', action: () => {} },
								{ label: 'Выход', action: () => {} }
							]}
						/>
					</View>
					<ScrollView style={{ flex: 1, width: '100%' }}>
						<View className="gap-[15px]">
							<PostListItemHeader isSubscribed />
							<PostBodyWrapper mode={PostType.POST_ITEM} />
							<Image
								style={{ height: SLIDE_ASPECT_RATIO }}
								source={require('@/assets/images/carousel/carousel-2.webp')}
								className="rounded-[25px] border-[1px] border-white/20 w-full"
								resizeMode="cover"
							/>
							<MapRoutesSwitchers />
							<PostListItemSlider data={PostSliderItems} />
							<PostListItemBottom />
						</View>
					</ScrollView>
				</Container>
				<StatusBar style="light" />
			</View>
		</SafeAreaProvider>
	)
}

export default Post
