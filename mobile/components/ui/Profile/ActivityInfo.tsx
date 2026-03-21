import React, { useEffect, useState } from 'react'
import { FlatList, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import WorkoutStats from '@/components/ui/Profile/WorkoutStats'
import Draggable from '@/components/Draggable'
import { SharedValue, useSharedValue } from 'react-native-reanimated'
import { CELL_W, CELL_H } from '@/helpers/drag'
import { cn } from '@/helpers/cn'
import { IActivity } from '@/api/activities'
import { UserActivity } from '../../../../shared/enums'
import { useEditActivitiesStore } from '@/store/editActivitiesStore'

interface IProps {
	label?: string
	isChooseMode?: boolean
	isEditMode?: boolean
	activities: IActivity[]
}

export type PositionsMap = Record<string, number>

const ActivityInfo = (props: IProps) => {
	const { newActivitiesOrder, setNewActivitiesOrder } = useEditActivitiesStore()
	const names = {
		[UserActivity.RUN]: 'Бег',
		[UserActivity.TRACK]: 'Трек',
		[UserActivity.BICYCLE]: 'Велосипед',
		[UserActivity.STEPS]: 'Шаги'
	}

	const positions: SharedValue<PositionsMap> = useSharedValue(
		Object.assign({}, ...props.activities.map((item, index) => ({ [index]: index })))
	)
	const [orderMap, setOrderMap] = useState<Record<number, IActivity>>( // { index -> itemUniqueName }
		Object.assign({}, ...props.activities.map((item, index) => ({ [index]: item })))
	)

	useEffect(() => {
		const map = Object.assign({}, ...props.activities.map((item, index) => ({ [index]: item })))

		setOrderMap(map)
	}, [props.activities])

	useEffect(() => {
		positions.value = Object.assign({}, ...props.activities.map((_, index) => ({ [index]: index })))
	}, [props.activities])

	const handleDragEnd = ({ oldOrder, newOrder }: { oldOrder: number; newOrder: number }) => {
		const next = [...newActivitiesOrder]

		const dragged = next[oldOrder]
		const target = next[newOrder]

		next[newOrder] = dragged
		if (target !== undefined) next[oldOrder] = target

		setNewActivitiesOrder(next) //  next activities order [{"goal": 100, "measuringUnit": "m", "name": "run", "place": 1}, {"goal": 200, "measuringUnit": "m", "name": "track", "place": 2}, {"goal": 10000, "measuringUnit": "cnt", "name": "steps", "place": 4}, {"goal": 300, "measuringUnit": "km", "name": "bicycle", "place": 3}]
	}

	// const handleDragEnd = ({ oldOrder, newOrder }: { oldOrder: number; newOrder: number }) => {
	// 	setOrderMap((prev) => {
	// 		const next = { ...prev }
	// 		// prev: { index -> itemUniqueName }
	// 		const draggedItemId = prev[oldOrder]
	// 		const targetItemId = prev[newOrder]
	// 		// ставим перетаскиваемый элемент на новую позицию
	// 		next[newOrder] = draggedItemId
	// 		// а на старую позицию возвращаем того, кто был на новой
	// 		if (typeof targetItemId !== 'undefined') next[oldOrder] = targetItemId
	//
	//   	setNewActivitiesOrder(Object.values(orderMap))
	// 		return next // {"0": {"goal": 300, "measuringUnit": "km", "name": "bicycle", "place": 3}, "1": {"goal": 200, "measuringUnit": "m", "name": "track", "place": 2}, "2": {"goal": 10000, "measuringUnit": "cnt", "name": "steps", "place": 4}, "3": {"goal": 100, "measuringUnit": "m", "name": "run", "place": 1}}
	// 	})
	// }

	return (
		<View
			className={cn('', {
				'gap-[15px]': !props.isChooseMode
			})}
		>
			{props.label && (
				<View className="flex-row justify-between">
					<Text className="text-base text-white" style={{ fontFamily: fontFamily.bold }}>
						{props.label}
					</Text>
				</View>
			)}
			{props.isChooseMode
				? props.activities.map((item, index) => (
						<Draggable key={item.name} positions={positions} id={index} onDragEnd={handleDragEnd}>
							<WorkoutStats
								style={{
									width: CELL_W,
									height: CELL_H
								}}
								label={names[item.name]}
								goal={item.goal}
								measuringUnit={item.measuringUnit}
								isCheckmarkExist={Object.values(orderMap)
									.slice(0, 3)
									.map((item) => item?.name)
									.includes(item.name)}
							/>
						</Draggable>
					))
				: Boolean(props.activities.length) && (
						<FlatList
							scrollEnabled={false}
							nestedScrollEnabled={true}
							removeClippedSubviews={false}
							initialNumToRender={props.activities.length}
							windowSize={props.activities.length}
							data={props.activities.slice(0, 3)}
							numColumns={3}
							renderItem={(activityItem) => (
								<WorkoutStats
									className="flex-1"
									label={names[activityItem.item.name]}
									goal={activityItem.item.goal}
									measuringUnit={activityItem.item.measuringUnit}
									isEditMode={props.isEditMode}
								/>
							)}
							contentContainerStyle={{ paddingHorizontal: 5 }}
							columnWrapperStyle={{ gap: 10, marginBottom: 10 }}
							keyExtractor={(item) => item.name}
						/>
					)}
		</View>
	)
}

export default ActivityInfo
