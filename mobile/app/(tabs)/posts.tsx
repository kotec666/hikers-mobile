import React, { useCallback, useEffect, useRef, useState } from 'react'
import { View, Text, Keyboard, RefreshControl, ActivityIndicator, TextInput, Platform } from 'react-native'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/ui/Container'
import { NotificationsButton } from '@/components/ui/Notifications/NotificationsButton'
import PostListItem from '@/components/ui/Post/PostListItem'
import { fontFamily } from '@/constants/Fonts'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { Button } from '@/components/ui/Button'
import PostSearchResult from '@/components/ui/Post/PostSearchResult'
import { LegendList, LegendListRef } from '@legendapp/list'
import { IPost } from '@/api/posts'
import { Colors } from '@/constants/Colors'
import { useFocusEffect, useLocalSearchParams } from 'expo-router'
import { adaptLocations } from '@/helpers/adaptPointsToIWorkoutLocationStorageItem'
import TrainingsEmpty from '@/components/ui/Post/TrainingsEmpty'
import { SearchType } from '@/shared/enums'
import { IFoundPost, IFoundUser } from '@/api/search'
import { PATH_TO_IMAGE } from '@/constants/PATH_TO_FILES'
import { RoundedButton } from '@/components/ui/HeaderBack'
import { useFeedPostsQuery } from '@/queries/posts'
import { useSearchQuery } from '@/queries/search'
import { Page } from '@/components/ui/Page'
import { KeyboardAvoidingView } from 'react-native-keyboard-controller'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import WorkoutMap from '@/components/map/WorkoutMap'

const isUser = (item: IFoundUser | IFoundPost): item is IFoundUser => {
	return 'username' in item
}

const isPost = (item: IFoundUser | IFoundPost): item is IFoundPost => {
	return 'title' in item
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
	const [debouncedSearchWord, setDebouncedSearchWord] = useState(searchWord)

	const {
		data: searchData = [],
		fetchNextPage: fetchNextSearchPage,
		hasNextPage: hasNextSearchPage,
		isFetchingNextPage: isFetchingNextSearchPage,
		refetch: refetchSearch,
		isRefetching: isRefetchingSearch
	} = useSearchQuery(debouncedSearchWord, state.searchMode)

	useEffect(() => {
		const handler = setTimeout(() => {
			setDebouncedSearchWord(searchWord.trim())
		}, 500)

		return () => clearTimeout(handler)
	}, [searchWord])

	const {
		data: posts = [],
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		refetch,
		isRefetching,
		isFetching
	} = useFeedPostsQuery()

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

	const dismissSearchKeyboard = useCallback(() => {
		searchInputRef.current?.blur()
		Keyboard.dismiss()
	}, [])

	useFocusEffect(
		useCallback(() => {
			return () => {
				dismissSearchKeyboard()
			}
		}, [dismissSearchKeyboard])
	)

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

	// Функция рендеринга элемента поста
	const renderPostItem = useCallback(({ item }: { item: IPost }) => {
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
				isLiked={item.isLiked}
				likesCount={item.likesCount}
				mapComponent={
					<WorkoutMap
						bordered
						rounded={25}
						needFinishMarker
						needFitInitialRoute
						interactiveDisabled
						initialLocations={adaptLocations(item.training.participants[0].route.points)}
					/>
				}
			/>
		)
	}, [])

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
			<Page edges={['top']}>
				<View style={{ flex: 1 }}>
					<Container className="gap-[20px] flex-1">
						<View className="flex-row justify-center items-center gap-[10px] w-full">
							<RoundedButton
								onPress={() => {
									Keyboard.dismiss()
									setState((s) => ({ ...s, isSearchActive: false }))
									setSearchWord('')
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
							style={{ flex: 1 }}
							// behavior={Platform.OS === 'ios' ? 'position' : 'height'}
							// keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
						>
							<View style={{ flex: 1 }}>
								<View>
									<View className="flex-row gap-[10px] mb-4">
										<Button
											onPress={() => setState((s) => ({ ...s, searchMode: SearchType.USERS }))}
											variant={state.searchMode === SearchType.USERS ? 'white' : 'black'}
											className="w-min px-[30px]"
											buttonContainerClassName="flex-1"
										>
											Люди
										</Button>
										<Button
											onPress={() => setState((s) => ({ ...s, searchMode: SearchType.POSTS }))}
											variant={state.searchMode === SearchType.POSTS ? 'white' : 'black'}
											className="w-min px-[30px]"
											buttonContainerClassName="flex-1"
										>
											Посты
										</Button>
									</View>

									<Text className="text-white text-base mb-3" style={{ fontFamily: fontFamily.bold }}>
										{state.searchMode === SearchType.USERS ? 'Люди' : 'Посты'}
									</Text>
								</View>
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
											onRefresh={() => refetchAndHaptics(refetchSearch)}
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
										paddingBottom: insets.bottom + (Platform.OS === 'android' ? 100 : 40),
										paddingTop: 10
									}}
									showsVerticalScrollIndicator={false}
								/>
							</View>
						</KeyboardAvoidingView>
					</Container>
				</View>
			</Page>
		)
	}

	// Основная лента постов
	return (
		<Page edges={['top']}>
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
									onRefresh={() => refetchAndHaptics(refetch)}
									tintColor={Colors['green-main']}
								/>
							}
							contentContainerStyle={{
								paddingBottom: insets.bottom + (Platform.OS === 'android' ? 100 : 40),
								flexGrow: 1
							}}
							showsVerticalScrollIndicator={false}
						/>
					</View>
				</Container>
			</View>
		</Page>
	)
}

export default PostsPage
