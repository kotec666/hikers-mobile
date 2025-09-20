import React from 'react'
import { SectionList, SafeAreaView, View, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import HeaderBack from '@/components/ui/HeaderBack'
import { Container } from '@/components/ui/Container'
import PeopleRunningSvg from '@/components/svg/PeopleRunningSvg'
import WorkoutHistoryListItem from '@/components/workout-history/WorkoutHistoryListItem'
import { fontFamily } from '@/constants/Fonts'
import { Select } from '@/components/ui/Select'

interface WorkoutItem {
	id: number
	title: string
	icon: React.JSX.Element
	month: string
}

interface GroupedData {
	[key: string]: WorkoutItem[]
}

interface Section {
	title: string
	data: WorkoutItem[]
}

const WorkoutHistory = () => {
	const insets = useSafeAreaInsets()

	const data = [
		{ id: 1, title: '7 июня, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июнь' },
		{ id: 2, title: '8 июня, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июнь' },
		{ id: 3, title: '9 июня, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июнь' },
		{ id: 4, title: '10 июня, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июнь' },
		{ id: 5, title: '11 июня, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июнь' },
		{ id: 6, title: '12 июня, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июнь' },
		{ id: 7, title: '7 июля, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июль' },
		{ id: 8, title: '8 июля, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июль' },
		{ id: 9, title: '9 июля, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июль' },
		{ id: 10, title: '10 июля, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июль' },
		{ id: 11, title: '11 июля, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июль' },
		{ id: 12, title: '13 июня, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июнь' },
		{ id: 13, title: '14 июня, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июнь' },
		{
			id: 14,
			title: '7 августа, 16:20, 15 км',
			icon: <PeopleRunningSvg width={26} height={26} />,
			month: 'Август'
		},
		{
			id: 15,
			title: '8 августа, 16:20, 15 км',
			icon: <PeopleRunningSvg width={26} height={26} />,
			month: 'Август'
		},
		{
			id: 16,
			title: '9 августа, 16:20, 15 км',
			icon: <PeopleRunningSvg width={26} height={26} />,
			month: 'Август'
		},
		{ id: 17, title: '15 июня, 16:20, 15 км', icon: <PeopleRunningSvg width={26} height={26} />, month: 'Июнь' },
		{
			id: 18,
			title: '7 сентября, 16:20, 15 км',
			icon: <PeopleRunningSvg width={26} height={26} />,
			month: 'Сентябрь'
		},
		{
			id: 19,
			title: '8 сентября, 16:20, 15 км',
			icon: <PeopleRunningSvg width={26} height={26} />,
			month: 'Сентябрь'
		},
		{
			id: 20,
			title: '9 сентября, 16:20, 15 км last',
			icon: <PeopleRunningSvg width={26} height={26} />,
			month: 'Сентябрь'
		}
	]

	const groupedData: GroupedData = data.reduce((acc: GroupedData, item: WorkoutItem) => {
		if (!acc[item.month]) {
			acc[item.month] = []
		}
		acc[item.month].push(item)
		return acc
	}, {} as GroupedData)

	const sections: Section[] = Object.keys(groupedData).map((month: string) => ({
		title: month,
		data: groupedData[month]
	}))

	const renderSectionHeader = ({ section }: { section: Section }) => (
		<View className="mb-[15px] mt-[15px]">
			<Text className="text-white text-base" style={{ fontFamily: fontFamily.bold }}>
				{section.title}
			</Text>
		</View>
	)

	return (
		<SafeAreaView style={{ flex: 1, paddingTop: insets.top }}>
			<Container className="gap-[20px] mt-[20px] flex-1">
				<HeaderBack>История тренировок</HeaderBack>
				<Select
					options={[
						{ value: '1', label: 'Опция 1' },
						{ value: '2', label: 'Опция 2' },
						{ value: '3', label: 'Опция 3' },
						{ value: '33', label: 'Опция 3 LAST' }
					]}
					// value={selectedValue}
					// onChange={setSelectedValue}
					placeholder="Выберите тип тренировки"
				/>

				<SectionList
					sections={sections}
					renderItem={({ item }) => <WorkoutHistoryListItem {...item} />}
					renderSectionHeader={renderSectionHeader}
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
	)
}

export default WorkoutHistory
