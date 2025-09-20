import React from 'react'
import { FlatList, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import WorkoutStats from '@/components/ui/Profile/WorkoutStats'

interface IProps {
	label?: string
	isChooseMode?: boolean
	isEditMode?: boolean
}

const ActivityInfo = (props: IProps) => {
	const data = [
		{ id: 1, label: 'Бег' },
		{ id: 2, label: 'Велосипед' },
		{ id: 3, label: 'Трек' },
		{ id: 4, label: 'Шаги' },
		{ id: 5, label: 'Прыгнул' },
		{ id: 6, label: 'Спал' },
		{ id: 7, label: 'Шаги' },
		{ id: 8, label: 'Прыгнул' },
		{ id: 9, label: 'Спал' }
	]

	return (
		<View className="gap-[15px]">
			{props.label && (
				<View className="flex-row justify-between">
					<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
						{props.label}
					</Text>
				</View>
			)}
			<FlatList
				scrollEnabled={false}
				nestedScrollEnabled={true}
				removeClippedSubviews={false}
				initialNumToRender={data.length}
				windowSize={data.length}
				data={data}
				numColumns={3}
				renderItem={() => <WorkoutStats isEditMode={props.isEditMode} isChooseMode={props.isChooseMode} />}
				contentContainerStyle={{ paddingHorizontal: 5 }}
				columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
				keyExtractor={(item) => item.id.toString()}
			/>
		</View>
	)
}

export default ActivityInfo
