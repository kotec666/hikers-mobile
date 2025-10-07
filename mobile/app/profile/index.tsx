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
import { useAuthStore } from '@/store/authStore'

/**
 *
 * Мой профиль
 *
 * */

const Profile = () => {
	const insets = useSafeAreaInsets()
	const router = useRouter()
	const { logout, user } = useAuthStore()

	const handleClickEdit = () => {
		router.push('/profile/edit')
	}

	const handleClickDocs = () => {
		router.push('/document')
	}

	const handleClickExit = () => {
		logout()
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
								<MoreOptionsButton
									icon={<SettingsSvg />}
									params={[
										{ label: 'Редактировать профиль', action: handleClickEdit },
										{ label: 'Политика конфиденциальности', action: handleClickDocs },
										{ label: 'Политика обработки персональных данных', action: handleClickDocs },
										{ label: 'Выход', action: handleClickExit }
									]}
								/>
							</View>
							<View>
								<Text className="text-[19px] text-white" style={{ fontFamily: fontFamily.bold }}>
									{user?.name}
								</Text>
								<Text className="text-base text-gray-ab" style={{ fontFamily: fontFamily.medium }}>
									@{user?.username}
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
