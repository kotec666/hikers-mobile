import React from 'react'
import { FlatList, ScrollView, Text, View } from 'react-native'
import { Container } from '@/components/ui/Container'
import { UserAvatar } from '@/components/ui/UserAvatar'
import MoreOptionsButton from '@/components/ui/MoreOptionsButton/MoreOptionsButton'
import { fontFamily } from '@/constants/Fonts'
import SocialStats from '@/components/ui/Profile/SocialStats'
import { Button } from '@/components/ui/Button'
import RedirectAchievementsInfo from '@/components/ui/Profile/RedirectAchievementsInfo'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import PostListItem from '@/components/ui/Post/PostListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import MoreOptionsSvg from '@/components/svg/MoreOptionsSvg'

/**
 *
 * Чужой профиль
 *
 * */

const UserProfilePage = () => {
	const insets = useSafeAreaInsets()

	const posts = [
		{ id: 1, authorName: 'Сергей Авдотьев', date: 'Вчера' },
		{ id: 2, authorName: 'Сергей Авдотьев', date: 'Вчера' },
		{ id: 3, authorName: 'Сергей Авдотьев', date: 'Вчера' }
	]

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
			<ScrollView>
				<Container className="gap-[20px]">
					<View className="gap-[20px]">
						<View className="gap-[16px]">
							<View className="flex-row justify-between w-full">
								<UserAvatar
									bordered
									className="w-[117px] h-[117px]"
									iconSize={{ width: 60, height: 60 }}
									avatar={false}
								/>
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
							<View>
								<Text className="text-[19px] text-white" style={{ fontFamily: fontFamily.bold }}>
									Чужой Профиль
								</Text>
								<Text className="text-base text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
									@oxxysergey
								</Text>
							</View>
						</View>
						<View className="flex-row justify-between gap-[20px]">
							<SocialStats />
							<SocialStats />
							<SocialStats />
						</View>
						<View className="flex-row gap-[10px]">
							<Button variant="white" buttonContainerClassName="flex-1">
								Подписаться
							</Button>
							<Button variant="black" buttonContainerClassName="flex-1">
								Добавить в друзья
							</Button>
						</View>
						<RedirectAchievementsInfo />
						<ActivityInfo label="Активности" />
					</View>
				</Container>
				<Container className="gap-[15px]">
					<Text
						className="text-base text-white border-b-[1px] border-b-black-44 py-[20px]"
						style={{ fontFamily: fontFamily.bold }}
					>
						Лента
					</Text>
					<FlatList
						data={posts}
						renderItem={({ item }) => <PostListItem key={item.id} {...item} />}
						keyExtractor={(item) => item.id.toString()}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						contentContainerStyle={{
							paddingBottom: insets.bottom + 20
						}}
						showsVerticalScrollIndicator={false}
					/>
				</Container>
			</ScrollView>
		</SafeAreaProvider>
	)
}

export default UserProfilePage
