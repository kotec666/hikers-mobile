import React from 'react'
import { FlatList, SafeAreaView, View } from 'react-native'
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context'
import HeaderBack from '@/components/ui/HeaderBack'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PeopleListItem from '@/components/find-people/PeopleListItem'

const FindPeople = () => {
	const insets = useSafeAreaInsets()

	const data = [
		{ id: 1, name: 'Стив Джобс first', avatar: true, isAdded: true },
		{ id: 2, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 3, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 4, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 5, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 6, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 7, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 8, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 9, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 10, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 11, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 12, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 13, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 14, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 15, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 16, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 17, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 18, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 19, name: 'Джефф Безос', avatar: false, isAdded: false },
		{ id: 20, name: 'Джефф Безос last', avatar: false, isAdded: false }
	]

	return (
		<SafeAreaProvider style={{ paddingTop: insets.top }}>
			<SafeAreaView style={{ flex: 1 }}>
				<Container className="gap-[20px] mt-[20px] flex-1">
					<HeaderBack>Совместная тренировка</HeaderBack>

					<View className="flex-row gap-[10px]">
						<Button variant="white" className="w-min px-[30px]">
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
			</SafeAreaView>
		</SafeAreaProvider>
	)
}

export default FindPeople
