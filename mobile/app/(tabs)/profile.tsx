import React, { useCallback, useEffect, useRef, useState } from 'react'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import SettingsSvg from '@/components/svg/SettingsSvg'
import MoreOptionsButton from '@/components/ui/MoreOptionsButton/MoreOptionsButton'
import { fontFamily } from '@/constants/Fonts'
import SocialStats from '@/components/ui/Profile/SocialStats'
import { Button } from '@/components/ui/Button'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import RedirectAchievementsInfo from '@/components/ui/Profile/RedirectAchievementsInfo'
import PostListItem from '@/components/ui/Post/PostListItem'
import { RelativePathString, useLocalSearchParams, useRouter } from 'expo-router'
import { useAuthStore } from '@/store/authStore'
import { getProfileData, IProfile } from '@/api/profile'
import { getFieldsErrors } from '@/helpers/getFieldsErrors'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'
import { AnimatedProfilePicture } from '@/components/ui/Profile/AnimatedProfilePicture'
import { LegendList, LegendListRef } from '@legendapp/list'
import { getPostsMy, IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import MapComponent from '@/components/map/MapComponent'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'

/**
 *
 * Мой профиль
 *
 * */

const ALLOWED_ROUTES = {
	EDIT_PROFILE: '/profile/edit' as RelativePathString,
	DOCUMENT: '/document' as RelativePathString,
	TABS_UI: '/(tabs-ui-kit)' as RelativePathString,
	WORKOUT_FINISH: '/training/viewWorkout' as RelativePathString
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

	// Состояние для infinite scroll постов
	const [posts, setPosts] = useState<IPost[]>([])
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const [hasMore, setHasMore] = useState(true)
	const limit = 5
	const legendListRef = useRef<LegendListRef>(null)
	const params = useLocalSearchParams()

	// Если пользователь кликнет на ту же страницу, то пойдёт скролл вверх. Навбар передаст params при переходе на эту же страницу
	useEffect(() => {
		if (params.scrollToTop && legendListRef.current) {
			legendListRef.current.scrollToOffset({ offset: 0, animated: true })
		}
	}, [params.scrollToTop])

	const handleClickRedirect = (page: AllowedRoute) => {
		router.push(page)
	}

	const handleClickExit = () => {
		logout()
		router.replace('/')
	}

	const handleGetAndSetData = async () => {
		try {
			const profileData = await getProfileData()
			setData((s) => ({ ...s, profileData: profileData }))
			setUser(profileData.user)
		} catch (e) {
			if (!e.response) {
				// Network error
				return
			}
			//console.log('errors:', e.toString() === 'TypeError: Network request failed')
			const errors = await e.response.json()
			getFieldsErrors(errors)
		} finally {
			setData((s) => ({ ...s, refreshing: false }))
		}
	}

	const sourceArray = newActivitiesOrder?.length ? newActivitiesOrder : data.profileData?.activities || []
	const activitiesToRender = sourceArray?.length >= 3 ? sourceArray?.slice(0, 3) : []

	// Функция для загрузки постов
	const loadPosts = useCallback(
		async (pageNum: number, isRefresh = false) => {
			if (loading && !isRefresh) return

			setLoading(true)
			try {
				const newPosts = await getPostsMy({ page: pageNum, limit })

				if (isRefresh) {
					setPosts(newPosts)
				} else {
					setPosts((prev) => [...prev, ...newPosts])
				}

				// Проверяем, есть ли еще посты
				if (newPosts.length < limit) {
					setHasMore(false)
				} else {
					setHasMore(true)
				}
			} catch (error) {
				console.error('Error loading posts:', error)
			} finally {
				setLoading(false)
			}
		},
		[loading, limit]
	)

	// Функция для загрузки следующей страницы
	const loadMorePosts = useCallback(() => {
		if (hasMore && !loading) {
			const nextPage = page + 1
			setPage(nextPage)
			loadPosts(nextPage)
		}
	}, [hasMore, loading, page, loadPosts])

	// Функция для обновления (pull-to-refresh)
	const onRefresh = useCallback(async () => {
		setData((s) => ({ ...s, refreshing: true }))
		setPage(1)
		setHasMore(true)

		// Загружаем данные профиля и посты одновременно
		await Promise.all([handleGetAndSetData(), loadPosts(1, true)])

		setData((s) => ({ ...s, refreshing: false }))
	}, [loadPosts])

	// Первоначальная загрузка данных
	useEffect(() => {
		const initializeData = async () => {
			await handleGetAndSetData()
			await loadPosts(1, true)
		}
		initializeData()
	}, [])

	// Функция рендеринга элемента поста
	const renderPostItem = useCallback(
		({ item }: { item: IPost }) => {
			return (
				<PostListItem
					key={item.id}
					{...item}
					isMyPost
					postId={item.id}
					authorId={item.userCreator?.id || ''}
					authorName={item.userCreator?.name || ''}
					avatar={item.userCreator.avatarFilename}
					createdAt={item.createdAt}
					workoutType={item.training.type}
					title={item.title}
					description={item.description}
					images={item.fileNames}
					metrics={
						item.training.participants.find((participant) => participant.user.id === user?.id)?.metrics
					}
					likeData={{
						isLiked: item.isLiked,
						likesCount: item.likesCount,
						postId: item.id
					}}
					participants={item.training.participants}
					mapComponent={
						<MapComponent
							rounded={25}
							interactiveDisabled
							initialLocations={{ current: adaptLocations(item.training.participants[0].route.points) }}
						/>
					}
				/>
			)
		},
		[user?.id]
	)

	// Функция рендеринга индикатора загрузки
	const renderFooter = useCallback(() => {
		if (!loading) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [loading])

	return (
		<>
			<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
				<LegendList
					ref={legendListRef}
					data={posts}
					renderItem={renderPostItem}
					keyExtractor={(item) => item.id.toString()}
					onEndReached={loadMorePosts}
					onEndReachedThreshold={0.5}
					ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
					ListFooterComponent={renderFooter}
					refreshControl={
						<RefreshControl refreshing={data.refreshing} onRefresh={onRefresh} tintColor="#22CB5A" />
					}
					ListHeaderComponent={
						<View className="gap-[20px] mb-[16px]">
							<View className="gap-[20px]">
								<View className="gap-[16px]">
									<View className="flex-row justify-between w-full">
										<AnimatedProfilePicture
											size={117}
											bordered
											imageUrl={`${PATH_TO_IMAGE}${user?.avatarFilename}`}
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
													label: 'Tabs ui',
													action: () => handleClickRedirect(ALLOWED_ROUTES.TABS_UI)
												},
												{
													label: 'To viewWorkout',
													action: () => handleClickRedirect(ALLOWED_ROUTES.WORKOUT_FINISH)
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
								<RedirectAchievementsInfo achievements={data.profileData?.achievements} isMyProfile />
								<ActivityInfo label="Активности" activities={activitiesToRender || []} />
							</View>
							<Text
								className="text-base text-white border-b-[1px] border-b-black-44 py-[20px]"
								style={{ fontFamily: fontFamily.bold }}
							>
								Лента
							</Text>
						</View>
					}
					contentContainerStyle={{ paddingBottom: 100, paddingHorizontal: 16 }}
				/>
			</SafeAreaProvider>
		</>
	)
}

export default Profile
