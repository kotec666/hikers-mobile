import {
	FlatList,
	View,
	Text,
	Platform,
	KeyboardAvoidingView,
	TouchableWithoutFeedback,
	Keyboard,
	Pressable
} from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/ui/Container'
import { NotificationsButton } from '@/components/ui/Notifications/NotificationsButton'
import PostListItem from '@/components/ui/Post/PostListItem'
import React, { useState } from 'react'
import PostsEmpty from '@/components/ui/Post/PostsEmpty'
import { fontFamily } from '@/constants/Fonts'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { Button } from '@/components/ui/Button'
import ArrowBackSvg from '@/components/svg/ArrowBackSvg'
import PostSearchResult from '@/components/ui/Post/PostSearchResult'

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

	const posts = [
		{ id: 1, authorName: 'Сергей Авдотьев', date: 'Вчера' },
		{ id: 2, authorName: 'Сергей Авдотьев', date: 'Вчера' },
		{ id: 3, authorName: 'Сергей Авдотьев', date: 'Вчера' }
	]

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

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] flex-1">
					<View className="flex-row justify-center items-center gap-[10px] w-full">
						{state.isSearchActive && (
							<Pressable
								onPress={() => {
									Keyboard.dismiss()
									setState((s) => ({ ...s, isSearchActive: false }))
								}}
								className="border-2 relative rounded-full h-[50px] w-[50px] border-black-44 justify-center items-center"
							>
								<ArrowBackSvg height={19} width={19} />
							</Pressable>
						)}
						<Input
							containerClassName="flex-1"
							onPress={() => setState((s) => ({ ...s, isSearchActive: true }))}
							isFind
							placeholder="Поиск"
						/>
						<NotificationsButton />
					</View>

					{!state.isSearchActive ? (
						<View style={{ flex: 1 }}>
							{!posts.length ? (
								<PostsEmpty />
							) : (
								<FlatList
									data={posts}
									renderItem={({ item }) => <PostListItem key={item.id} {...item} />}
									keyExtractor={(item) => item.id.toString()}
									ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
									contentContainerStyle={{
										paddingBottom: insets.bottom + 20
									}}
									showsVerticalScrollIndicator={false}
								/>
							)}
						</View>
					) : (
						<KeyboardAvoidingView
							behavior={Platform.OS === 'ios' ? 'position' : 'height'}
							style={{ flex: 1 }}
							keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} // @TODO чекнуть на ios
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
										paddingBottom: insets.bottom + 20,
										paddingTop: 10
									}}
									showsVerticalScrollIndicator={false}
									keyboardDismissMode="interactive"
									keyboardShouldPersistTaps="handled"
								/>
							</View>
						</KeyboardAvoidingView>
					)}
				</Container>
			</View>
			<StatusBar style="light" />
		</SafeAreaProvider>
	)
}

export default PostsPage
