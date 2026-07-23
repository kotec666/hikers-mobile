import React, { useCallback, useEffect, useRef } from 'react'
import { ActivityIndicator, Platform, Pressable, RefreshControl, Text, View } from 'react-native'
import SettingsSvg from '@/components/svg/SettingsSvg'
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
import { IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import TrainingsEmpty from '@/components/ui/Post/TrainingsEmpty'
import BlurProvider from '@/components/providers/BlurProvider'
import { useProfilePostsQuery } from '@/queries/posts'
import { useProfileQuery, useUpdateProfileBadgeMutation } from '@/queries/my-profile'
import { Page } from '@/components/ui/Page'
import { useQueryClient } from '@tanstack/react-query'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WorkoutMap from '@/components/map/WorkoutMap'
import DailyActivityRedirect from '@/components/activity-rings/DailyActivityRedirect'
import { RoundedButton } from '@/components/ui/HeaderBack'
import PopupMenuItem from '@/components/ui/Popup/PopupMenuItem'
import PopupMenu from '@/components/ui/Popup/PopupMenu'
import { EmojiSheetModule } from 'expo-native-sheet-emojis'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import EditSvg from '@/components/svg/EditSvg'
import ExitSvg from '@/components/svg/ExitSvg'
import AboutSvg from '@/components/svg/AboutSvg'

/**
 *
 * Мой профиль
 *
 * */

const ALLOWED_ROUTES = {
	EDIT_PROFILE: '/profile/edit' as RelativePathString,
	ABOUT: '/(about)' as RelativePathString,
	SETTINGS: '/(settings)' as RelativePathString,
	RESULTS_PAGE: '/training/viewWorkout' as RelativePathString
} as const satisfies Record<string, RelativePathString>

type AllowedRoute = (typeof ALLOWED_ROUTES)[keyof typeof ALLOWED_ROUTES]

const Profile = () => {
	const router = useRouter()
	const queryClient = useQueryClient()
	const insets = useSafeAreaInsets()
	const { push } = useSafeNavigation()
	const { user, logout } = useAuthStore()
	const params = useLocalSearchParams()
	const flashListRef = useRef<FlashListRef<IPost>>(null)

	const { data: profileData, isFetching: isProfileFetching, refetch: refetchProfile } = useProfileQuery()
	const { mutateAsync: updateProfileBadge } = useUpdateProfileBadgeMutation()

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
		if (params.scrollToTop && flashListRef.current) {
			flashListRef.current.scrollToOffset({ offset: 0, animated: true })
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

	const handlePressEmojiPick = async () => {
		const result = await EmojiSheetModule.present({
			categoryBarPosition: 'top',
			layoutDirection: 'auto',
			enableAnimations: true,
			theme: {
				backgroundColor: Colors['black-0d'],
				searchBarBackgroundColor: 'white',
				textColor: 'black',
				textSecondaryColor: Colors['gray-ab'],
				// searchTextColor?: Colors['gray-ab'],
				// placeholderTextColor?: string;
				accentColor: Colors['green-main'],
				// selectionColor?: string;
				// categoryIconColor?: string;
				// categoryActiveIconColor?: string;
				categoryActiveBackgroundColor: Colors['black-5c'],
				// handleColor?: string;
				dividerColor: Colors['gray-ab']
				// categoryBarBackgroundColor?: string;
			},
			translations: {
				searchPlaceholder: 'Поиск эмодзи',
				noResultsText: 'Ничего не найдено',
				categoryNames: {
					search_results: 'Результаты поиска',
					frequently_used: 'Недавно использованные',
					smileys_emotion: 'Смайлики и эмоции',
					people_body: 'Люди и тело',
					animals_nature: 'Животные и природа',
					food_drink: 'Еда и напитки',
					travel_places: 'Путешествия и места',
					activities: 'Активности',
					objects: 'Объекты',
					symbols: 'Символы',
					flags: 'Флаги'
				}
			}
		})

		if (!result.cancelled) {
			await updateProfileBadge(result.emoji)
		}
	}

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
						<WorkoutMap
							bordered
							rounded={25}
							needFinishMarker
							needFitInitialRoute
							interactiveDisabled
							routeColor={item.userCreator.color}
							initialLocations={adaptLocations(item.training.participants[0].route.points)}
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

	const SEPARATOR = () => <View style={{ height: 16 }} />

	return (
		<Page edges={['top']}>
			<BlurProvider>
				<FlashList
					ref={flashListRef}
					data={posts}
					renderItem={renderPostItem}
					keyExtractor={(item) => item.id}
					onEndReached={() => {
						if (postsHasNextPage && !postsIsFetchingNextPage) {
							fetchNextPostsPage()
						}
					}}
					onEndReachedThreshold={0.4}
					ItemSeparatorComponent={SEPARATOR}
					ListEmptyComponent={renderEmpty}
					ListFooterComponent={renderFooter}
					refreshControl={
						<RefreshControl
							refreshing={isProfileFetching || postsIsRefetching}
							onRefresh={() => refetchAndHaptics(onRefreshAll)}
							tintColor={Colors['green-main']}
						/>
					}
					ListHeaderComponent={
						<View className="gap-[20px] mb-[16px]">
							<View className="gap-[20px]">
								<View className="gap-[16px]">
									{/*<EmailNotConfirmed*/}
									{/*	isVisible={shouldShowEmailConfirmation}*/}
									{/*	email={profileData?.user?.email}*/}
									{/*/>*/}
									<View className="flex-row justify-between w-full">
										<AnimatedProfilePicture
											size={117}
											bordered
											imageUrl={`${PATH_TO_IMAGE}${profileData?.user?.avatarFilename}`}
										/>

										<PopupMenu
											menuWidth={230}
											menuHeight={300}
											trigger={({ open }) => (
												<RoundedButton onPress={open} icon={<SettingsSvg />} />
											)}
										>
											<PopupMenuItem
												title="Редактировать профиль"
												onPress={() => handleClickRedirect(ALLOWED_ROUTES.EDIT_PROFILE)}
											>
												<View className="flex-row items-center gap-3">
													<EditSvg size={18} color="white" />
													<Text className="text-white text-base">Редактировать профиль</Text>
												</View>
											</PopupMenuItem>
											<PopupMenuItem
												title="О приложении"
												onPress={() => handleClickRedirect(ALLOWED_ROUTES.ABOUT)}
											>
												<View className="flex-row items-center gap-3">
													<AboutSvg size={18} color="white" />
													<Text className="text-white text-base">О приложении</Text>
												</View>
											</PopupMenuItem>
											<PopupMenuItem
												title="Настройки"
												onPress={() => handleClickRedirect(ALLOWED_ROUTES.SETTINGS)}
											>
												<View className="flex-row items-center gap-3">
													<SettingsSvg size={18} color="white" />
													<Text className="text-white text-base">Настройки</Text>
												</View>
											</PopupMenuItem>
											<PopupMenuItem
												title="results page"
												onPress={() => handleClickRedirect(ALLOWED_ROUTES.RESULTS_PAGE)}
											/>
											<PopupMenuItem title="Выход" onPress={handleClickExit}>
												<View className="flex-row items-center gap-3">
													<ExitSvg size={18} color="white" />
													<Text className="text-white text-base">Выход</Text>
												</View>
											</PopupMenuItem>
										</PopupMenu>
									</View>
									<View>
										<Pressable
											onPress={handlePressEmojiPick}
											className="flex-row items-center gap-3"
										>
											{profileData?.user?.name && (
												<Text
													className="text-[19px] text-white"
													style={{ fontFamily: fontFamily.bold }}
												>
													{profileData?.user?.name}
												</Text>
											)}
											{profileData?.user?.badge && (
												<Text className="text-xl" style={{ fontFamily: fontFamily.bold }}>
													{profileData.user.badge}
												</Text>
											)}
										</Pressable>
										<Text
											className="text-base text-gray-ab"
											style={{ fontFamily: fontFamily.medium }}
										>
											@{profileData?.user?.username}
										</Text>
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
								<DailyActivityRedirect />
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
						paddingBottom: insets.bottom + (Platform.OS === 'android' ? 100 : 40),
						paddingHorizontal: 16
					}}
				/>
			</BlurProvider>
		</Page>
	)
}

export default Profile
