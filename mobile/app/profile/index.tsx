import React, { useEffect, useState } from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Container } from '@/components/ui/Container'
import { ScrollView, View, Text, RefreshControl } from 'react-native'
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
import { getProfileData, IProfile } from '@/api/profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'

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
	const { logout, user, setUser } = useAuthStore()
	const { newActivitiesOrder } = useEditActivitiesStore()
	const [data, setData] = useState<{
		profileData?: IProfile
		refreshing: boolean
	}>({
		profileData: undefined,
		refreshing: false
	})

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

	const handleGetAndSetData = async () => {
		try {
			const profileData = await getProfileData()
			setData((s) => ({ ...s, profileData: profileData }))
			setUser(profileData.user)
		} catch (e) {
			const errors = await e.response.json()
			console.log(errors)
			getFieldsErrors(errors)
		} finally {
			setData((s) => ({ ...s, refreshing: false }))
		}
	}

	useEffect(() => {
		handleGetAndSetData()
	}, [])

	const onRefresh = React.useCallback(async () => {
		setData((s) => ({ ...s, refreshing: true }))
		await handleGetAndSetData()
	}, [])


    const sourceArray = newActivitiesOrder?.length ? newActivitiesOrder : data.profileData?.activities || []
    const activitiesToRender = sourceArray?.length >= 3 ? sourceArray?.slice(0, 3) : []

	return (
		<>
			<NavBar />
			<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
				<ScrollView refreshControl={<RefreshControl refreshing={data.refreshing} onRefresh={onRefresh} tintColor="#22CB5A" />}>
					<Container className="gap-[20px]">
						<View className="gap-[20px]">
							<View className="gap-[16px]">
								<View className="flex-row justify-between w-full">
									<UserAvatar
										bordered
										className="w-[117px] h-[117px]"
										iconSize={{ width: 60, height: 60 }}
										avatar={`${PATH_TO_IMAGE}${user?.avatarFilename}`}
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
								<SocialStats
									label="Подписчики"
									content={data.profileData?.subscribers}
									hrefTo="/subscribers/my-subscribers"
								/>
								<SocialStats
									label="Друзья"
									content={data.profileData?.friends}
									hrefTo="/friends/my-friends"
								/>
								<SocialStats
									label="Подписки"
									content={data.profileData?.subscriptions}
									hrefTo="/subscribers/my-subscriptions"
								/>
							</View>
							<Button variant="white">История тренировок</Button>
							<RedirectAchievementsInfo achievements={data.profileData?.achievements} />
							<ActivityInfo label="Активности" activities={activitiesToRender || []} />
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
