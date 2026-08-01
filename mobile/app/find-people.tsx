import React from 'react'
import { View } from 'react-native'
import HeaderBack from '@/components/ui/HeaderBack'
import { Container } from '@/components/ui/Container'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import PeopleListItem from '@/components/find-people/PeopleListItem'
import { useSafeNavigation } from '@/hooks/useSafeNavigation'
import { Page } from '@/components/ui/Page'
import { FlashList } from '@shopify/flash-list'

export enum FRIEND_STATUS {
	ADDED = 'added',
	NOT_ADDED = 'not-added',
	SENT = 'sent'
}

// import PeopleRemoveSvg from '@/components/svg/PeopleRemoveSvg'
// import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
// import RoundedCheckMark from '@/components/svg/RoundedCheckMark'

const FindPeople = () => {
	const { push } = useSafeNavigation()

	const data = [
		{ id: '1', name: 'Joseph olaf Shcholz', username: 'Стив Джобс first', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '2', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleAddSvg />
		{ id: '3', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <RoundedCheckMark />
		{ id: '4', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '5', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '6', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '7', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '8', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '9', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '10', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '11', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '12', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '13', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '14', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '15', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '16', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '17', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '18', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{ id: '19', name: 'Joseph olaf Shcholz', username: 'Джефф Безос', avatar: '' }, // icon: <PeopleRemoveSvg />
		{
			id: '20',
			name: 'Joseph olaf Shcholz',
			username: 'Джефф Безос last',
			avatar: ''
			// icon: <PeopleRemoveSvg />
		}
	]

	return (
		<Page>
			<View style={{ flex: 1 }}>
				<Container className="gap-[20px] flex-1">
					<HeaderBack>Совместная тренировка</HeaderBack>

					<View className="flex-row gap-[10px]">
						<Button variant="white" className="w-min px-[30px]" onPress={() => push('/(tabs)/profile')}>
							Поиск
						</Button>
						<Button variant="black" className="w-min px-[30px]">
							Участники
						</Button>
					</View>

					<Input isFind placeholder="Поиск участников" />

					<FlashList
						data={data}
						renderItem={({ item }) => <PeopleListItem {...item} />}
						keyExtractor={(item) => item.id.toString()}
						ItemSeparatorComponent={() => <View style={{ height: 15 }} />}
						contentContainerStyle={{
							paddingBottom: 20,
							paddingTop: 10
						}}
						showsVerticalScrollIndicator={false}
					/>
				</Container>
			</View>
		</Page>
	)
}

export default FindPeople
