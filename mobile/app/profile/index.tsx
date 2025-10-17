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
import { RelativePathString, useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import NavBar from '@/components/ui/NavBar'

/**
 *
 * Мой профиль
 *
 * */

const ALLOWED_ROUTES = {
	EDIT_PROFILE: '/profile/edit' as RelativePathString,
	DOCUMENT: '/document' as RelativePathString,
	TABS: '/(tabs)' as RelativePathString
} as const satisfies Record<string, RelativePathString>

type AllowedRoute = (typeof ALLOWED_ROUTES)[keyof typeof ALLOWED_ROUTES]

const Profile = () => {
	const insets = useSafeAreaInsets()
	const router = useRouter()
	const { logout, user } = useAuthStore()

	const handleClickRedirect = (page: AllowedRoute) => {
		router.push(page)
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
		<>
			<NavBar />
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
											{
												label: 'Редактировать профиль',
												action: () => handleClickRedirect(ALLOWED_ROUTES.EDIT_PROFILE)
											},
											{
												label: 'Политика конфиденциальности',
												action: () => handleClickRedirect(ALLOWED_ROUTES.DOCUMENT)
											},
											{
												label: 'Политика обработки персональных данных',
												action: () => handleClickRedirect(ALLOWED_ROUTES.DOCUMENT)
											},
											{
												label: 'Tabs (index)',
												action: () => handleClickRedirect(ALLOWED_ROUTES.TABS)
											},
											{ label: 'Выход', action: handleClickExit }
										]}
									/>
								</View>
								<View>
									{user?.name && (
										<Text
											className="text-[19px] text-white"
											style={{ fontFamily: fontFamily.bold }}
										>
											{user?.name}
										</Text>
									)}
									{user?.username && (
										<Text
											className="text-base text-gray-ab"
											style={{ fontFamily: fontFamily.medium }}
										>
											@{user?.username}
										</Text>
									)}
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
		</>
	)
}

export default Profile
