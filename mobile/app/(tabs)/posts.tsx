import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
	View,
	Text,
	Platform,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
	RefreshControl,
	ActivityIndicator,
	TextInput
} from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/ui/Container'
import { NotificationsButton } from '@/components/ui/Notifications/NotificationsButton'
import PostListItem from '@/components/ui/Post/PostListItem'
import { fontFamily } from '@/constants/Fonts'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { Button } from '@/components/ui/Button'
import PostSearchResult from '@/components/ui/Post/PostSearchResult'
import { LegendList, LegendListRef } from '@legendapp/list'
import { getPostsFeed, IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import { useLocalSearchParams } from 'expo-router'
import MapComponent from '@/components/map/MapComponent'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import TrainingsEmpty from '@/components/ui/Post/TrainingsEmpty'
import { SearchType } from '@/shared/enums'
import { IFoundPost, IFoundUser, searchByAllItems } from '@/api/search'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { BackButton } from '@/components/ui/HeaderBack'

const isUser = (item: IFoundUser | IFoundPost): item is IFoundUser => {
	return 'username' in item
}

const isPost = (item: IFoundUser | IFoundPost): item is IFoundPost => {
	return 'title' in item
}

interface IInfinitePosts {
	pages: IPost[][]
	pageParams: number[]
}

const PostsPage = () => {
	const insets = useSafeAreaInsets()
	const queryClient = useQueryClient()

	const [state, setState] = useState<{
		isSearchActive: boolean
		searchMode: SearchType
	}>({
		isSearchActive: false,
		searchMode: SearchType.USERS
	})

	// State для поиска
	const [searchWord, setSearchWord] = useState('')
	const [debouncedSearchWord, setDebouncedSearchWord] = useState(searchWord)

	const searchLimit = 15

	const {
		data: searchDataRaw,
		fetchNextPage: fetchNextSearchPage,
		hasNextPage: hasNextSearchPage,
		isFetchingNextPage: isFetchingNextSearchPage,
		refetch: refetchSearch,
		isRefetching: isRefetchingSearch
	} = useInfiniteQuery({
		queryKey: ['search', debouncedSearchWord, state.searchMode],
		enabled: debouncedSearchWord.trim().length >= 2,
		queryFn: ({ pageParam = 1, signal }) => {
			return searchByAllItems(
				{
					page: pageParam,
					limit: searchLimit,
					word: debouncedSearchWord,
					type: state.searchMode
				},
				signal
			)
		},
		initialPageParam: 1,
		getNextPageParam: (lastPage, pages) => (lastPage.length === searchLimit ? pages.length + 1 : undefined)
	})

	const searchData = searchDataRaw?.pages.flat() ?? []

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchWord(searchWord.trim())
		}, 500)

		return () => clearTimeout(handler)
	}, [searchWord])

	// Состояние для infinite scroll постов
	const postsLimit = 5

	const {
		data: posts = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useInfiniteQuery<IPost[], Error, IPost[], ['posts-feed'], number>({
		queryKey: ['posts-feed'],

		queryFn: ({ pageParam }) =>
			getPostsFeed({
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

	const legendListRef = useRef<LegendListRef>(null)
	const searchInputRef = useRef<TextInput>(null)
	const params = useLocalSearchParams<{
		scrollToTop?: string
		quickAction?: string
		quickActionAt?: string
	}>()

	const activateSearch = useCallback(() => {
		setState((s) => (s.isSearchActive ? s : { ...s, isSearchActive: true }))
	}, [])

	useEffect(() => {
		if (!state.isSearchActive) return

		const timeoutId = setTimeout(() => {
			searchInputRef.current?.focus()
		}, 0)

		return () => clearTimeout(timeoutId)
	}, [state.isSearchActive])

	useEffect(() => {
		if (params.quickAction !== 'search') return

		activateSearch()

		const timeoutId = setTimeout(() => {
			searchInputRef.current?.focus()
		}, 0)

		return () => clearTimeout(timeoutId)
	}, [activateSearch, params.quickAction, params.quickActionAt])

	// Если пользователь кликнет на ту же страницу, то пойдёт скролл вверх. Навбар передаст params при переходе на эту же страницу
	useEffect(() => {
		if (params.scrollToTop && legendListRef.current) {
			legendListRef.current.scrollToOffset({ offset: 0, animated: true })
		}
	}, [params.scrollToTop])

	const toggleSubscribeCallback = useCallback(
		(isSubscribed: boolean, authorId?: string) => {
			queryClient.setQueryData<IInfinitePosts>(['posts-feed'], (oldData) => {
				if (!oldData) return oldData

				return {
					...oldData,
					pages: oldData.pages.map((page: IPost[]) =>
						page.map((post) => (post.userCreator.id === authorId ? { ...post, isSubscribed } : post))
					)
				}
			})
		},
		[queryClient]
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
					// mapComponent={
					// 	<MapComponent
					// 		rounded={25}
					// 		needFinishMarker
					// 		interactiveDisabled
					// 		initialLocations={{ current: adaptLocations(item.training.participants[0].route.points) }}
					// 	/>
					// }
				/>
			)
		},
		[toggleSubscribeCallback]
	)

	// Функция рендеринга индикатора загрузки
	const renderFooter = useCallback(() => {
		if (!isFetchingNextPage) return null

		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [isFetchingNextPage])

	// Функция рендеринга пустого состояния
	const renderEmpty = useCallback(() => {
		if (isFetching) return null

		return <TrainingsEmpty text="К сожалению, постов еще не существует, опубликуйте пост после тренировки" />
	}, [isFetching])

	if (state.isSearchActive) {
		return (
			<SafeAreaProvider
				style={{ paddingTop: insets.top, paddingBottom: insets.bottom, backgroundColor: Colors['black-0d'] }}
			>
				<View style={{ flex: 1 }}>
					<Container className="gap-[20px] flex-1">
						<View className="flex-row justify-center items-center gap-[10px] w-full">
							<BackButton
								onPress={() => {
									Keyboard.dismiss()
									setState((s) => ({ ...s, isSearchActive: false }))
								}}
							/>
							<Input
								key="posts-search-input"
								ref={searchInputRef}
								autoFocus
								isFind
								containerClassName="flex-1"
								onFocus={activateSearch}
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
									// key={`${state.searchMode}`}
									data={searchData}
									ListEmptyComponent={
										<View className="flex-1 justify-center items-center">
											<Text
												className="text-gray-ab text-center text-[19px]"
												style={{ fontFamily: fontFamily.regular }}
											>
												{searchWord.trim().length < 2
													? 'Введите хотя бы 2 символа'
													: 'Ничего не нашлось'}
											</Text>
										</View>
									}
									renderItem={({ item }) => {
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

										console.warn('Unknown item type', item)
										return <Text className="text-red-500">Unknown item type</Text>
									}}
									keyExtractor={(item) => item.id}
									onEndReached={() => {
										if (hasNextSearchPage && !isFetchingNextSearchPage) {
											fetchNextSearchPage()
										}
									}}
									refreshControl={
										<RefreshControl
											refreshing={isRefetchingSearch}
											onRefresh={refetchSearch}
											tintColor={Colors['green-main']}
										/>
									}
									onEndReachedThreshold={0.4}
									ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
									ListFooterComponent={
										isFetchingNextSearchPage ? (
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
		<SafeAreaProvider style={{ paddingTop: insets.top, backgroundColor: Colors['black-0d'] }}>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] flex-1">
					<View className="flex-row justify-center items-center gap-[10px] w-full">
						<Input
							key="posts-search-input"
							ref={searchInputRef}
							isFind
							containerClassName="flex-1"
							onFocus={activateSearch}
							onPressIn={activateSearch}
							value=""
							onChangeText={setSearchWord}
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
							keyExtractor={(item) => item.id}
							onEndReached={() => {
								if (hasNextPage && !isFetchingNextPage) {
									fetchNextPage()
								}
							}}
							onEndReachedThreshold={0.5}
							ListEmptyComponent={renderEmpty}
							ListFooterComponent={renderFooter}
							ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
							refreshControl={
								<RefreshControl
									refreshing={isRefetching}
									onRefresh={refetch}
									tintColor={Colors['green-main']}
								/>
							}
							contentContainerStyle={{
								paddingBottom: insets.bottom + 100,
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
