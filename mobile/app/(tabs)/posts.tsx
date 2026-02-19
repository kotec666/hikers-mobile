import React, { useCallback, useEffect, useRef, useState } from 'react'
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
import { StatusBar } from 'expo-status-bar'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/ui/Container'
import { NotificationsButton } from '@/components/ui/Notifications/NotificationsButton'
import PostListItem from '@/components/ui/Post/PostListItem'
import PostsEmpty from '@/components/ui/Post/PostsEmpty'
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

enum SearchMode {
	PEOPLE = 'people',
	POSTS = 'posts'
}

const PostsPage = () => {
	const insets = useSafeAreaInsets()
	const [state, setState] = useState<{
		isSearchActive: boolean
		searchMode: SearchMode
	}>({
		isSearchActive: false,
		searchMode: SearchMode.PEOPLE
	})

	// Состояние для infinite scroll постов
	const [posts, setPosts] = useState<IPost[]>([])
	const [page, setPage] = useState(1)
	const [loading, setLoading] = useState(false)
	const [refreshing, setRefreshing] = useState(false)
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

	// Функция для загрузки постов из ленты
	const loadPosts = useCallback(
		async (pageNum: number, isRefresh = false) => {
			if (loading && !isRefresh) return

			setLoading(true)
			try {
				const newPosts = await getPostsFeed({ page: pageNum, limit })

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
				if (isRefresh) {
					setRefreshing(false)
				}
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
		setRefreshing(true)
		setPage(1)
		setHasMore(true)
		await loadPosts(1, true)
	}, [loadPosts])

	// Первоначальная загрузка данных
	useEffect(() => {
		loadPosts(1, true)
	}, [])

	const toggleSubscribeCallback = (isSubscribed: boolean, authorId?: string) => {
		setPosts((prev) =>
			prev.map((post) => (post.userCreator.id === authorId ? { ...post, isSubscribed: isSubscribed } : post))
		)
	}

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
	}, [])

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
		return <PostsEmpty />
	}, [loading])

	// @TODO Удалить
	const data = [
		{ id: 1, name: 'Стив Джобс first', avatar: true },
		{ id: 2, name: 'Джефф Безос', avatar: false },
		{ id: 3, name: 'Джефф Безос', avatar: false },
		{ id: 4, name: 'Джефф Безос', avatar: false },
		{ id: 5, name: 'Джефф Безос', avatar: false },
		{ id: 6, name: 'Джефф Безос', avatar: false },
		{ id: 7, name: 'Джефф Безос', avatar: false },
		{ id: 8, name: 'Джефф Безос', avatar: false },
		{ id: 9, name: 'Джефф Безос', avatar: false },
		{ id: 10, name: 'Джефф Безос', avatar: false },
		{ id: 11, name: 'Джефф Безос', avatar: false },
		{ id: 12, name: 'Джефф Безос', avatar: false },
		{ id: 13, name: 'Джефф Безос', avatar: false },
		{ id: 14, name: 'Джефф Безос', avatar: false },
		{ id: 15, name: 'Джефф Безос', avatar: false },
		{ id: 16, name: 'Джефф Безос', avatar: false },
		{ id: 17, name: 'Джефф Безос', avatar: false },
		{ id: 18, name: 'Джефф Безос', avatar: false },
		{ id: 19, name: 'Джефф Безос', avatar: false },
		{ id: 20, name: 'Джефф Безос last', avatar: false }
	]

	if (state.isSearchActive) {
		return (
			<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
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
								<TouchableWithoutFeedback
									onPress={Keyboard.dismiss}
									style={{ borderWidth: 2, borderColor: 'red' }}
								>
									<View>
										<View className="flex-row gap-[10px] mb-4">
											<Button
												onPress={() =>
													setState((s) => ({ ...s, searchMode: SearchMode.PEOPLE }))
												}
												variant={state.searchMode === SearchMode.PEOPLE ? 'white' : 'black'}
												className="w-min px-[30px]"
											>
												Люди
											</Button>
											<Button
												onPress={() =>
													setState((s) => ({ ...s, searchMode: SearchMode.POSTS }))
												}
												variant={state.searchMode === SearchMode.POSTS ? 'white' : 'black'}
												className="w-min px-[30px]"
											>
												Посты
											</Button>
										</View>

										<Text
											className="text-white text-base mb-3"
											style={{ fontFamily: fontFamily.bold }}
										>
											{state.searchMode === SearchMode.PEOPLE ? 'Люди' : 'Посты'}
										</Text>
									</View>
								</TouchableWithoutFeedback>
								<FlatList
									data={data}
									renderItem={({ item, index }) => {
										switch (state.searchMode) {
											case SearchMode.PEOPLE:
												return <PeopleListItem key={item.id} {...item} />
											case SearchMode.POSTS:
												return <PostSearchResult key={item.id} {...item} index={index} />
										}
									}}
									keyExtractor={(item) => item.id.toString()}
									ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
									contentContainerStyle={{
										paddingBottom: 100,
										paddingTop: 10
									}}
									showsVerticalScrollIndicator={false}
									keyboardDismissMode="interactive"
									keyboardShouldPersistTaps="handled"
								/>
							</View>
						</KeyboardAvoidingView>
					</Container>
				</View>
				<StatusBar style="light" />
			</SafeAreaProvider>
		)
	}

	// Основная лента постов
	return (
		<SafeAreaProvider style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
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
							renderItem={renderPostItem}
							keyExtractor={(item) => item.id.toString()}
							onEndReached={loadMorePosts}
							onEndReachedThreshold={0.5}
							ListEmptyComponent={renderEmpty}
							ListFooterComponent={renderFooter}
							ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
							refreshControl={
								<RefreshControl
									refreshing={refreshing}
									onRefresh={onRefresh}
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
			<StatusBar style="light" />
		</SafeAreaProvider>
	)
}

export default PostsPage
