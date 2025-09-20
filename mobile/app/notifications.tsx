import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { FlatList, SafeAreaView, View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import React from 'react'
import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import FriendRequestSentSvg from '@/components/svg/FriendRequestSentSvg'
import { fontFamily } from '@/constants/Fonts'
import { NotificationListItem } from '@/components/ui/Notifications/NotificationListItem'
import { Button } from '@/components/ui/Button'

const NotificationsPage = () => {
	const insets = useSafeAreaInsets()

	const data = [
		{ id: 1, name: 'Стив Джобс first', avatar: true, icon: <PeopleAddSvg /> },
		{ id: 2, name: 'Джефф Безос', avatar: false, icon: <FriendRequestSentSvg /> },
		{ id: 3, name: 'Джефф Безос', avatar: false, icon: <FriendRequestSentSvg /> },
		{ id: 4, name: 'Джефф Безос', avatar: false, icon: <FriendRequestSentSvg /> },
		{ id: 5, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 6, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 7, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 8, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 9, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 10, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 11, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 12, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 13, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 14, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 15, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 16, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 17, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 18, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 19, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
		{ id: 20, name: 'Джефф Безос last', avatar: false, icon: <PeopleRemoveSvg /> }
	]

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<SafeAreaView style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Уведомления</HeaderBack>
					{!data.length ? null : <Button variant="white">Очистить все уведомления</Button>}

					{!data.length ? (
						<View style={{ flex: 1 }} className="items-center justify-center">
							<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
								Уведомления отсутствуют
							</Text>
						</View>
					) : (
						<FlatList
							data={data}
							renderItem={({ item }) => <NotificationListItem {...item} />}
							keyExtractor={(item) => item.id.toString()}
							ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
							contentContainerStyle={{
								paddingBottom: insets.bottom + 20,
								paddingTop: 10
							}}
							showsVerticalScrollIndicator={false}
						/>
					)}
				</Container>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default NotificationsPage
