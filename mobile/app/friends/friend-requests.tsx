import React from 'react'
import { FlatList, SafeAreaView, View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import RoundedPlusSvg from '@/components/svg/RoundedPlusSvg'
import RoundedMinusSvg from '@/components/svg/RoundedMinusSvg'

const FriendRequestsPage = () => {
	const insets = useSafeAreaInsets()

	const data = [
		{
			id: 1,
			name: 'Стив Джобс first',
			avatar: true,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 2,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 3,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 4,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 5,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 6,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 7,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 8,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 9,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 10,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 11,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 12,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 13,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 14,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 15,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 16,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 17,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 18,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 19,
			name: 'Джефф Безос',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		},
		{
			id: 20,
			name: 'Джефф Безос last',
			avatar: false,
			icon: [<RoundedPlusSvg key="plus1" />, <RoundedMinusSvg key="plus2" />]
		}
	]

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<SafeAreaView style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Запросы в друзья</HeaderBack>
					{!data.length ? (
						<View style={{ flex: 1 }} className="items-center justify-center">
							<Text style={{ fontFamily: fontFamily.regular }} className="text-gray-ab text-base">
								У вас нет заявок в друзья
							</Text>
						</View>
					) : (
						<FlatList
							data={data}
							renderItem={({ item }) => <PeopleListItem {...item} />}
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

export default FriendRequestsPage
