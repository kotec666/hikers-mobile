import React from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import { ScrollView, View, Text } from 'react-native'
import { UserAvatar } from '@/components/ui/UserAvatar'
import SettingsSvg from '@/components/svg/SettingsSvg'
import MoreOptionsButton from '@/components/ui/MoreOptionsButton/MoreOptionsButton'
import { fontFamily } from '@/constants/Fonts'
import SocialStats from '@/components/ui/Profile/SocialStats'
import { Button } from '@/components/ui/Button'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import RedirectAchievementsInfo from '@/components/ui/Profile/RedirectAchievementsInfo'
import PostListItem from '@/components/ui/Post/PostListItem'
import { useRouter } from 'expo-router'

/**
 *
 * Мой профиль
 *
 * */

const Profile = () => {
	const insets = useSafeAreaInsets()
	const router = useRouter()

	const handleClick = () => {
		router.push('/profile/edit')
	}

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
								<MoreOptionsButton action={handleClick} icon={<SettingsSvg />} />
							</View>
							<View>
								<Text className="text-[19px] text-white" style={{ fontFamily: fontFamily.bold }}>
									Сергей Авдотьев
								</Text>
								<Text className="text-base text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
									@oxxysergey
								</Text>
							</View>
						</View>
						<View className="flex-row justify-between gap-[10px]">
							<SocialStats />
							<SocialStats />
							<SocialStats />
						</View>
						<Button variant="white">История тренировок</Button>
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
					{posts.map((post) => (
						<PostListItem key={post.id} {...post} isMyPost />
					))}
				</Container>
			</ScrollView>
		</SafeAreaProvider>
	)
}

export default Profile
