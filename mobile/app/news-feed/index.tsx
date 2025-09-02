import { FlatList, SafeAreaView, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { StatusBar } from 'expo-status-bar'
import { Input } from '@/components/ui/Input'
import { Container } from '@/components/ui/Container'
import { NotificationsButton } from '@/components/ui/Notifications/NotificationsButton'
import PostListItem from '@/components/ui/Post/PostListItem'
import React from 'react'
import PostsEmpty from '@/components/ui/Post/PostsEmpty'

const NewsFeedPage = () => {
	const insets = useSafeAreaInsets()

	const posts = [
		{ id: 1, authorName: 'Сергей Авдотьев', date: 'Вчера' },
		{ id: 2, authorName: 'Сергей Авдотьев', date: 'Вчера' },
		{ id: 3, authorName: 'Сергей Авдотьев', date: 'Вчера' }
	]

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<SafeAreaView style={{ flex: 1, alignItems: 'center' }}>
				<Container className="gap-[20px]">
					<View className="flex-row gap-[10px] w-full">
						<Input isFind placeholder="Поиск" />
						<NotificationsButton />
					</View>
					<View className="flex-1 items-center justify-center">
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
				</Container>
				<StatusBar style="light" />
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default NewsFeedPage
