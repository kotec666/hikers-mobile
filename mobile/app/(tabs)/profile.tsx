import React, {useCallback, useEffect, useRef, useState} from 'react'
import {SafeAreaProvider, useSafeAreaInsets} from 'react-native-safe-area-context'
import {ActivityIndicator, RefreshControl, Text, View} from 'react-native'
import SettingsSvg from '@/components/svg/SettingsSvg'
import MoreOptionsButton from '@/components/ui/MoreOptionsButton/MoreOptionsButton'
import {fontFamily} from '@/constants/Fonts'
import SocialStats from '@/components/ui/Profile/SocialStats'
import {Button} from '@/components/ui/Button'
import ActivityInfo from '@/components/ui/Profile/ActivityInfo'
import RedirectAchievementsInfo from '@/components/ui/Profile/RedirectAchievementsInfo'
import PostListItem from '@/components/ui/Post/PostListItem'
import {RelativePathString, useFocusEffect, useLocalSearchParams, useRouter} from 'expo-router'
import {useAuthStore} from '@/store/authStore'
import {getProfileData, IProfile} from '@/api/profile'
import {PATH_TO_IMAGE} from '@/constants/PATH_TO_FILES'
import {AnimatedProfilePicture} from '@/components/ui/Profile/AnimatedProfilePicture'
import {LegendList, LegendListRef} from '@legendapp/list'
import {getPostsMy, IPost} from '@/api/posts'
import {Colors} from '@/constants/Colors'
import MapComponent from '@/components/map/MapComponent'
import {adaptLocations} from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import {useSafeNavigation} from '@/hooks/useSafeNavigation'
import {useInfiniteQuery} from '@tanstack/react-query'
import TrainingsEmpty from '@/components/ui/Post/TrainingsEmpty'
import {getFieldsErrors} from '@/helpers/getFieldsErrors'
import WorkoutActivity, {
    getActivityTypeIcon,
    WorkoutActivityProps
} from "@/components/ui/LiveActivities/WorkoutActivity";
import {LiveActivity} from "expo-widgets";
import {TrainingType} from "@shared/enums";
import {WorkoutTypesMap} from "@/constants/WorkoutTypes";

/**
 *
 * Мой профиль
 *
 * */

const ALLOWED_ROUTES = {
	EDIT_PROFILE: '/profile/edit' as RelativePathString,
	DOCUMENT: '/document' as RelativePathString
} as const satisfies Record<string, RelativePathString>

type AllowedRoute = (typeof ALLOWED_ROUTES)[keyof typeof ALLOWED_ROUTES]

const Profile = () => {
	const insets = useSafeAreaInsets()
	const { push } = useSafeNavigation()
	const router = useRouter()
	const { user, setUser, logout } = useAuthStore()
	const params = useLocalSearchParams()
	const legendListRef = useRef<LegendListRef>(null)

	const [profileData, setProfileData] = useState<IProfile | undefined>(undefined)
	const [refreshingProfile, setRefreshingProfile] = useState(false)

	const postsLimit = 5
	const {
		data: posts = [],
		fetchNextPage: fetchNextPostsPage,
		hasNextPage: hasNextPostsPage,
		isFetchingNextPage: isFetchingPostsNextPage,
		refetch: postsRefetch,
		isRefetching: postsIsRefetching,
		isFetching: isPostsFetching
	} = useInfiniteQuery<IPost[], Error, IPost[], ['posts-my-profile'], number>({
		queryKey: ['posts-my-profile'],

		queryFn: ({ pageParam }) =>
			getPostsMy({
				page: pageParam,
				limit: postsLimit
			}),
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => {
			if (lastPage.length < postsLimit) return undefined
			return pages.length + 1
		},

		select: (data) => data.pages.flat()
	})

	// Если пользователь кликнет на ту же страницу, то пойдёт скролл вверх. Навбар передаст params при переходе на эту же страницу
	useEffect(() => {
		if (params.scrollToTop && legendListRef.current) {
			legendListRef.current.scrollToOffset({ offset: 0, animated: true })
		}
	}, [params.scrollToTop])

	const handleClickRedirect = (page: AllowedRoute) => {
		push(page)
	}

	const handleClickExit = () => {
		logout()
		router.replace('/')
	}

	const loadProfile = useCallback(async () => {
		setRefreshingProfile(true)
		try {
			const profile = await getProfileData()
			setProfileData(profile)
			setUser(profile.user)
		} catch (e: unknown) {
			await getFieldsErrors(e)
		} finally {
			setRefreshingProfile(false)
		}
	}, [setUser])

	const onRefreshAll = useCallback(async () => {
		setRefreshingProfile(true)
		await Promise.all([loadProfile(), postsRefetch()]) // , refresh()
		setRefreshingProfile(false)
	}, [loadProfile, postsRefetch]) // , refresh

	// Первоначальная загрузка данных (при фокусе на странице)
	useFocusEffect(
		useCallback(() => {
			const init = async () => {
				await Promise.all([loadProfile()]) // , refresh()
			}
			init()
		}, [loadProfile])
	)

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
		if (!isFetchingPostsNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [isFetchingPostsNextPage]) // loading

	const renderEmpty = useCallback(() => {
		if (isPostsFetching) return null

		return <TrainingsEmpty text="Постов еще не существует, опубликуйте пост после тренировки" />
	}, [isPostsFetching])

	const liveActivityWorkoutInstanceRef = useRef<LiveActivity<WorkoutActivityProps>>(null)

	const startWorkoutActivity = () => {
	    // Start the Live Activity
	    const instance = WorkoutActivity.start({
            formattedDistance: '1.07',
	        formattedTime: '0:07',
            formattedSpeed: '7.5',
	        isPaused: false,
            icon: getActivityTypeIcon(TrainingType.WALK),
            typeLabel: WorkoutTypesMap?.[TrainingType.WALK]?.name ?? 'Тренировка'
	    });
	    liveActivityWorkoutInstanceRef.current = instance
	    // Store instance
	};

	const updateWorkoutActivity = () => {
	    if (!liveActivityWorkoutInstanceRef.current) return
	    liveActivityWorkoutInstanceRef.current.update(
	        {
                formattedDistance: '1.07',
                formattedTime: '0:07',
                formattedSpeed: '7.5',
	            isPaused: true,
                icon: getActivityTypeIcon(TrainingType.WALK),
                typeLabel: WorkoutTypesMap?.[TrainingType.WALK]?.name ?? 'Тренировка'
	        }
	    );
	}


	const endWorkoutActivity = () => {
	    if (!liveActivityWorkoutInstanceRef.current) return
	    liveActivityWorkoutInstanceRef.current.end('immediate')
	}

	return (
		<>
			<SafeAreaProvider
				style={{ paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: Colors['black-0d'] }}
			>
				<LegendList
					ref={legendListRef}
					data={posts}
					renderItem={renderPostItem}
					keyExtractor={(item) => item.id}
					// onEndReached={loadMore}
					onEndReached={() => {
						if (hasNextPostsPage && !isFetchingPostsNextPage) {
							fetchNextPostsPage()
						}
					}}
					onEndReachedThreshold={0.4}
					ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
					ListEmptyComponent={renderEmpty}
					ListFooterComponent={renderFooter}
					refreshControl={
						<RefreshControl
							refreshing={refreshingProfile || postsIsRefetching}
							onRefresh={onRefreshAll}
							tintColor={Colors['green-main']}
						/>
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
													label: 'blur',
													action: () => handleClickRedirect('/blur')
												},
												// {
												// 	label: 'Tabs ui',
												// 	action: () => handleClickRedirect('/(tabs-ui-kit)' as AllowedRoute)
												// },
												// {
												// 	label: 'To view workout',
												// 	action: () =>
												// 		handleClickRedirect(
												// 			`/training/viewWorkout?mode=${VIEWWORKOUT_MODE.VIEW}` as AllowedRoute
												// 		)
												// },
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
								<Button variant="white" onPress={startWorkoutActivity}>
								    Start workout activity
								</Button>
								<Button variant="white" onPress={updateWorkoutActivity}>
								    update workout activity
								</Button>
								<Button variant="white" onPress={endWorkoutActivity}>
								    stop workout activity
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
					contentContainerStyle={{ flexGrow: 1, paddingBottom: 100, paddingHorizontal: 16 }}
				/>
			</SafeAreaProvider>
		</>
	)
}

export default Profile
