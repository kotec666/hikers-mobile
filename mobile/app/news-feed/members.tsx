import React from 'react'
import { FlatList, SafeAreaView, View, Text } from 'react-native'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import { fontFamily } from '@/constants/Fonts'
import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
import RoundedCheckMark from '@/components/svg/RoundedCheckMark'
import { Colors } from '@/constants/Colors'
import RoundedPlusSvg from '@/components/svg/RoundedPlusSvg'

const Members = () => {
	const insets = useSafeAreaInsets()

	const data = [
		{ id: 1, name: 'Стив Джобс first', avatar: true, icon: <RoundedPlusSvg color={Colors['orange-main']} /> },
		{ id: 2, name: 'Джефф Безос', avatar: false, icon: <RoundedCheckMark color={Colors['green-main']} /> },
		{ id: 3, name: 'Джефф Безос', avatar: false, icon: <RoundedPlusSvg color={Colors['blue-00']} /> },
		{ id: 4, name: 'Джефф Безос', avatar: false, icon: <PeopleRemoveSvg /> },
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
					<HeaderBack>Участники</HeaderBack>
					<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
						Люди
					</Text>

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
				</Container>
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default Members
