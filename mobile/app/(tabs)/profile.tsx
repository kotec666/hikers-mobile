import React, { useCallback, useEffect, useRef } from 'react'
import { ActivityIndicator, RefreshControl, Text, View } from 'react-native'
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
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { AnimatedProfilePicture } from '@/components/ui/Profile/AnimatedProfilePicture'
import { LegendList, LegendListRef } from '@legendapp/list'
import { IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import MapComponent from '@/components/map/MapComponent'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import TrainingsEmpty from '@/components/ui/Post/TrainingsEmpty'
import BlurProvider from '@/components/providers/BlurProvider'
import { useProfilePostsQuery } from '@/queries/posts'
import { useProfileQuery } from '@/queries/my-profile'
import { Page } from '@/components/ui/Page'
import { useQueryClient } from '@tanstack/react-query'
import EmailNotConfirmed from '@/components/profile/EmailNotConfirmed'

/**
 *
 * Мой профиль
 *
 * */

const ALLOWED_ROUTES = {
	EDIT_PROFILE: '/profile/edit' as RelativePathString,
	ABOUT: '/(about)' as RelativePathString,
	SETTINGS: '/(settings)' as RelativePathString,
	TEST_RESULTS_PAGE: '/training/results' as RelativePathString,
	RESULTS_PAGE: '/training/viewWorkout' as RelativePathString
} as const satisfies Record<string, RelativePathString>

type AllowedRoute = (typeof ALLOWED_ROUTES)[keyof typeof ALLOWED_ROUTES]

const Profile = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const { push } = useSafeNavigation()
	const { user, logout } = useAuthStore()
	const params = useLocalSearchParams()
	const legendListRef = useRef<LegendListRef>(null)

	const { data: profileData, isFetching: isProfileFetching, refetch: refetchProfile } = useProfileQuery()
	const shouldShowEmailConfirmation =
		!isProfileFetching && Boolean(profileData) && !profileData?.user.isEmailConfirmed

	const {
		data: posts = [],
		fetchNextPage: fetchNextPostsPage,
		hasNextPage: postsHasNextPage,
		isFetchingNextPage: postsIsFetchingNextPage,
		refetch: postsRefetch,
		isRefetching: postsIsRefetching,
		isFetching: postsIsFetching
	} = useProfilePostsQuery()

	// Если пользователь кликнет на ту же страницу, то пойдёт скролл вверх. Навбар передаст params при переходе на эту же страницу
	useEffect(() => {
		if (params.scrollToTop && legendListRef.current) {
			legendListRef.current.scrollToOffset({ offset: 0, animated: true })
		}
	}, [params.scrollToTop])

	const handleClickRedirect = (page: AllowedRoute) => {
		push(page)
	}

	const handleClickExit = async () => {
		await logout()
		queryClient.clear()
		router.replace('/')
	}

	const onRefreshAll = useCallback(async () => {
		await Promise.all([refetchProfile(), postsRefetch()]) // , refresh()
	}, [refetchProfile, postsRefetch]) // , refresh

	// Функция рендеринга элемента поста
	const renderPostItem = useCallback(
		({ item }: { item: IPost }) => {
			const userMetrics = item.training.participants.find((p) => p.user.id === user?.id)?.metrics
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
					metrics={userMetrics}
					isLiked={item.isLiked}
					likesCount={item.likesCount}
					participants={item.training.participants}
					mapComponent={
						<MapComponent
							rounded={25}
							interactiveDisabled
							needFinishMarker
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
		//if (!loading) return null
		if (!postsIsFetchingNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [postsIsFetchingNextPage]) // loading

	const renderEmpty = useCallback(() => {
		if (postsIsFetching) return null

		return <TrainingsEmpty text="Постов еще не существует, опубликуйте пост после тренировки" />
	}, [postsIsFetching])

	return (
		<Page>
			<BlurProvider>
				<LegendList
					ref={legendListRef}
					data={posts}
					renderItem={renderPostItem}
					keyExtractor={(item) => item.id}
					onEndReached={() => {
						if (postsHasNextPage && !postsIsFetchingNextPage) {
							fetchNextPostsPage()
						}
					}}
					onEndReachedThreshold={0.4}
					ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
					ListEmptyComponent={renderEmpty}
					ListFooterComponent={renderFooter}
					refreshControl={
						<RefreshControl
							refreshing={isProfileFetching || postsIsRefetching}
							onRefresh={onRefreshAll}
							tintColor={Colors['green-main']}
						/>
					}
					ListHeaderComponent={
						<View className="gap-[20px] mb-[16px]">
							<View className="gap-[20px]">
								<View className="gap-[16px]">
									<EmailNotConfirmed
										isVisible={shouldShowEmailConfirmation}
										email={profileData?.user?.email}
									/>
									<View className="flex-row justify-between w-full">
										<AnimatedProfilePicture
											size={117}
											bordered
											imageUrl={`${PATH_TO_IMAGE}${profileData?.user?.avatarFilename}`}
										/>
										<MoreOptionsButton
											icon={<SettingsSvg />}
											params={[
												{
													label: 'Редактировать профиль',
													action: () => handleClickRedirect(ALLOWED_ROUTES.EDIT_PROFILE)
												},
												{
													label: 'О приложении',
													action: () => handleClickRedirect(ALLOWED_ROUTES.ABOUT)
												},
												{
													label: 'Настройки',
													action: () => handleClickRedirect(ALLOWED_ROUTES.SETTINGS)
												},
												{
													label: 'results page test',
													action: () => handleClickRedirect(ALLOWED_ROUTES.TEST_RESULTS_PAGE)
												},
												{
													label: 'results page',
													action: () => handleClickRedirect(ALLOWED_ROUTES.RESULTS_PAGE)
												},
												{ label: 'Выход', action: handleClickExit }
											]}
										/>
									</View>
									<View>
										{profileData?.user?.name && (
											<Text
												className="text-[19px] text-white"
												style={{ fontFamily: fontFamily.bold }}
											>
												{profileData?.user?.name}
											</Text>
										)}
										{profileData?.user?.username && (
											<Text
												className="text-base text-gray-ab"
												style={{ fontFamily: fontFamily.medium }}
											>
												@{profileData?.user?.username}
											</Text>
										)}
									</View>
								</View>

								<View className="flex-row justify-between gap-[10px]">
									<SocialStats
										label="Подписчики"
										content={profileData?.subscribers}
										hrefTo="/subscribers/my-subscribers"
									/>
									<SocialStats
										label="Друзья"
										content={profileData?.friends}
										hrefTo="/friends/my-friends"
									/>
									<SocialStats
										label="Подписки"
										content={profileData?.subscriptions}
										hrefTo="/subscribers/my-subscriptions"
									/>
								</View>
								<Button variant="white" onPress={() => push('/workout-history')}>
									История тренировок
								</Button>
								<RedirectAchievementsInfo achievements={profileData?.achievements} isMyProfile />
								<ActivityInfo label="Активности" activities={profileData?.activities || []} />
							</View>
							<Text
								className="text-base text-white border-b-[1px] border-b-black-44 py-[20px]"
								style={{ fontFamily: fontFamily.bold }}
							>
								Лента
							</Text>
						</View>
					}
					contentContainerStyle={{
						flexGrow: 1,
						paddingBottom: 100,
						paddingHorizontal: 16
					}}
				/>
			</BlurProvider>
		</Page>
	)
}

export default Profile
