import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
	FlatList,
	View,
	Text,
	Platform,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
	RefreshControl,
	ActivityIndicator
} from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/ui/Container'
import { NotificationsButton } from '@/components/ui/Notifications/NotificationsButton'
import PostListItem from '@/components/ui/Post/PostListItem'
import { fontFamily } from '@/constants/Fonts'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { Button } from '@/components/ui/Button'
import ArrowBackSvg from '@/components/svg/ArrowBackSvg'
import PostSearchResult from '@/components/ui/Post/PostSearchResult'
import { LegendList, LegendListRef } from '@legendapp/list'
import { getPostsFeed, IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import { useLocalSearchParams } from 'expo-router'
import MapComponent from '@/components/map/MapComponent'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import { Motion } from '@legendapp/motion'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import TrainingsEmpty from '@/components/ui/Post/TrainingsEmpty'
import { SearchType } from '@/shared/enums'
import { IFoundPost, IFoundUser, searchByAllItems } from '@/api/search'
import { debounce } from '@/helpers/debounce'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'

const isUser = (item: IFoundUser | IFoundPost): item is IFoundUser => {
	return 'email' in item
}

const isPost = (item: IFoundUser | IFoundPost): item is IFoundPost => {
	return 'training' in item
}

const PostsPage = () => {
	const insets = useSafeAreaInsets()
	const [state, setState] = useState<{
		isSearchActive: boolean
		searchMode: SearchType
	}>({
		isSearchActive: false,
		searchMode: SearchType.USERS
	})

	// State для поиска
	const [searchWord, setSearchWord] = useState('')

	const {
		data: searchResults,
		loading: searchLoading,
		refreshing: searchRefreshing,
		loadMore: loadMoreSearch,
		refresh: refreshSearch
	} = usePaginatedList<IFoundUser | IFoundPost, { word?: string; type?: SearchType }>({
		fetchFn: ({ page, limit, word, type }) => {
			if (!word || word.trim().length < 2) return Promise.resolve([])
			return searchByAllItems({ page, limit, word, type })
		},
		limit: 10, // @TODO Не работает пагинация в поиске
		autoLoad: false
	})

	const debouncedSearchRef = useRef(
		debounce((word: string, type: SearchType) => {
			refreshSearch({ word, type })
		}, 500)
	)

	useEffect(() => {
		if (!searchWord.trim()) {
			refreshSearch({}) // сброс поиска
			return
		}
		if (searchWord.trim().length >= 2) {
			debouncedSearchRef.current(searchWord, state.searchMode)
		}
	}, [searchWord, state.searchMode])

	// Состояние для infinite scroll постов
	const limit = 5
	const {
		data: posts,
		setData: setPosts,
		loading,
		refreshing,
		loadMore,
		refresh
	} = usePaginatedList<IPost, void>({
		fetchFn: ({ page, limit }) => getPostsFeed({ page, limit }),
		limit
	})

	const legendListRef = useRef<LegendListRef>(null)
	const params = useLocalSearchParams()

	// Если пользователь кликнет на ту же страницу, то пойдёт скролл вверх. Навбар передаст params при переходе на эту же страницу
	useEffect(() => {
		if (params.scrollToTop && legendListRef.current) {
			legendListRef.current.scrollToOffset({ offset: 0, animated: true })
		}
	}, [params.scrollToTop])

	const toggleSubscribeCallback = useCallback(
		(isSubscribed: boolean, authorId?: string) => {
			setPosts((prev) =>
				prev.map((post) => (post.userCreator.id === authorId ? { ...post, isSubscribed: isSubscribed } : post))
			)
		},
		[setPosts]
	)

	// Функция рендеринга элемента поста
	const renderPostItem = useCallback(
		({ item }: { item: IPost }) => {
			// Находим метрики текущего пользователя среди участников
			const userMetrics = item.training.participants.find(
				(participant) => participant.user.id === item.userCreator.id
			)?.metrics

			return (
				<PostListItem
					key={item.id}
					{...item}
					postId={item.id}
					authorId={item.userCreator?.id || ''}
					authorName={item.userCreator?.name || ''}
					avatar={item.userCreator.avatarFilename}
					createdAt={item.createdAt}
					workoutType={item.training.type}
					title={item.title}
					description={item.description}
					metrics={userMetrics}
					participants={item.training.participants}
					images={item.fileNames}
					subscribeData={{
						authorId: item.userCreator.id,
						isSubscribed: item.isSubscribed
					}}
					likeData={{
						isLiked: item.isLiked,
						postId: item.id,
						likesCount: item.likesCount
					}}
					onToggleSubscribeCallback={toggleSubscribeCallback}
					mapComponent={
						<MapComponent
							rounded={25}
							needFinishMarker
							interactiveDisabled
							initialLocations={{ current: adaptLocations(item.training.participants[0].route.points) }}
						/>
					}
				/>
			)
		},
		[toggleSubscribeCallback]
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

	// Функция рендеринга пустого состояния
	const renderEmpty = useCallback(() => {
		if (loading) return null
		return <TrainingsEmpty text="К сожалению, постов еще не существует, опубликуйте пост после тренировки" />
	}, [loading])

	if (state.isSearchActive) {
		return (
			<SafeAreaProvider
				style={{ paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: Colors['black-0d'] }}
			>
				<View style={{ flex: 1 }}>
					<Container className="gap-[20px] flex-1">
						<View className="flex-row justify-center items-center gap-[10px] w-full">
							<Motion.Pressable
								onPress={() => {
									Keyboard.dismiss()
									setState((s) => ({ ...s, isSearchActive: false }))
								}}
							>
								<Motion.View
									className="border-2 relative rounded-full h-[50px] w-[50px] border-black-44 justify-center items-center"
									whileTap={{ scale: 0.8 }}
									transition={{
										type: 'spring',
										damping: 20,
										stiffness: 400
									}}
								>
									<ArrowBackSvg height={19} width={19} />
								</Motion.View>
							</Motion.Pressable>
							<Input
								isFind
								containerClassName="flex-1"
								onPress={() => setState((s) => ({ ...s, isSearchActive: true }))}
								value={searchWord}
								onChangeText={setSearchWord}
								placeholder="Поиск"
							/>
							<NotificationsButton />
						</View>

						<KeyboardAvoidingView
							behavior={Platform.OS === 'ios' ? 'position' : 'height'}
							style={{ flex: 1 }}
							keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
						>
							<View style={{ flex: 1 }}>
								<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
									<View>
										<View className="flex-row gap-[10px] mb-4">
											<Button
												onPress={() =>
													setState((s) => ({ ...s, searchMode: SearchType.USERS }))
												}
												variant={state.searchMode === SearchType.USERS ? 'white' : 'black'}
												className="w-min px-[30px]"
												buttonContainerClassName="flex-1"
											>
												Люди
											</Button>
											<Button
												onPress={() =>
													setState((s) => ({ ...s, searchMode: SearchType.POSTS }))
												}
												variant={state.searchMode === SearchType.POSTS ? 'white' : 'black'}
												className="w-min px-[30px]"
												buttonContainerClassName="flex-1"
											>
												Посты
											</Button>
										</View>

										<Text
											className="text-white text-base mb-3"
											style={{ fontFamily: fontFamily.bold }}
										>
											{state.searchMode === SearchType.USERS ? 'Люди' : 'Посты'}
										</Text>
									</View>
								</TouchableWithoutFeedback>
								<LegendList
									// key={`${state.searchMode}-${searchWord}`}
									data={searchResults}
									ListEmptyComponent={
										<View className="flex-1 justify-center items-center ">
											<Text
												className="text-gray-ab text-center text-[19px]"
												style={{ fontFamily: fontFamily.regular }}
											>
												Ничего не нашлось
											</Text>
										</View>
									}
									renderItem={({ item, index }) => {
										if (state.searchMode === SearchType.USERS && isUser(item)) {
											return (
												<PeopleListItem
													{...item}
													avatar={
														item.avatarFilename
															? `${PATH_TO_IMAGE}${item.avatarFilename}`
															: null
													}
												/>
											)
										}

										if (state.searchMode === SearchType.POSTS && isPost(item)) {
											return <PostSearchResult {...item} />
										}

										return null
									}}
									keyExtractor={(item) => item.id}
									onEndReached={loadMoreSearch}
									onEndReachedThreshold={0.4}
									refreshing={searchRefreshing}
									onRefresh={refreshSearch}
									ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
									ListFooterComponent={
										searchLoading ? (
											<View style={{ padding: 20 }}>
												<ActivityIndicator size="small" color={Colors['green-main']} />
											</View>
										) : null
									}
									contentContainerStyle={{
										flexGrow: 1,
										paddingBottom: 100,
										paddingTop: 10
									}}
									showsVerticalScrollIndicator={false}
								/>
							</View>
						</KeyboardAvoidingView>
					</Container>
				</View>
			</SafeAreaProvider>
		)
	}

	// Основная лента постов
	return (
		<SafeAreaProvider
			style={{ paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: Colors['black-0d'] }}
		>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] flex-1">
					<View className="flex-row justify-center items-center gap-[10px] w-full">
						<Input
							isFind
							containerClassName="flex-1"
							onPress={() => setState((s) => ({ ...s, isSearchActive: true }))}
							placeholder="Поиск"
						/>
						<NotificationsButton />
					</View>

					<View style={{ flex: 1 }}>
						<LegendList
							ref={legendListRef}
							data={posts}
							style={{ flex: 1 }}
							renderItem={renderPostItem}
							keyExtractor={(item) => item.id.toString()}
							onEndReached={loadMore}
							onEndReachedThreshold={0.5}
							ListEmptyComponent={renderEmpty}
							ListFooterComponent={renderFooter}
							ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
							refreshControl={
								<RefreshControl
									refreshing={refreshing}
									onRefresh={refresh}
									tintColor={Colors['green-main']}
								/>
							}
							contentContainerStyle={{
								paddingBottom: 100,
								flexGrow: 1
							}}
							showsVerticalScrollIndicator={false}
						/>
					</View>
				</Container>
			</View>
		</SafeAreaProvider>
	)
}

export default PostsPage
