import React from 'react'
import { FlatList, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import HeaderBack from '@/components/ui/HeaderBack'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import RoundedCheckMark from '@/components/svg/RoundedCheckMark'
import { useRouter } from 'expo-router'

export enum FRIEND_STATUS {
	ADDED = 'added',
	NOT_ADDED = 'not-added',
	SENT = 'sent'
}

const FindPeople = () => {
	const insets = useSafeAreaInsets()

	const data = [
		{ id: 1, name: 'Стив Джобс first', avatar: true, icon: <PeopleRemoveSvg /> },
		{ id: 2, name: 'Джефф Безос', avatar: false, icon: <PeopleAddSvg /> },
		{ id: 3, name: 'Джефф Безос', avatar: false, icon: <RoundedCheckMark /> },
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

	const router = useRouter()

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Совместная тренировка</HeaderBack>

					<View className="flex-row gap-[10px]">
						<Button
							variant="white"
							className="w-min px-[30px]"
							onPress={() => router.push('/(tabs)/profile')}
						>
							Поиск
						</Button>
						<Button variant="black" className="w-min px-[30px]">
							Участники
						</Button>
					</View>

					<Input isFind placeholder="Поиск участников" />

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
			</View>
		</SafeAreaProvider>
	)
}

export default FindPeople
