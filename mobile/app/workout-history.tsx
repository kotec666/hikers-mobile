import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { View, Text, RefreshControl, ActivityIndicator } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import HeaderBack from '@/components/ui/HeaderBack'
import { Container } from '@/components/ui/Container'
import PeopleRunningSvg from '@/components/svg/PeopleRunningSvg'
import WorkoutHistoryListItem from '@/components/workout-history/WorkoutHistoryListItem'
import { fontFamily } from '@/constants/Fonts'
import { Select } from '@/components/ui/Select'
import { WorkoutTypesData } from '@/constants/WorkoutTypes'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import SaveUnsavedTrainingSvg from '@/components/svg/SaveUnsavedTrainingSvg'
import DeleteTrashSvg from '@/components/svg/DeleteTrashSvg'
import { usePaginatedList } from '@/hooks/usePaginatedList'
import { getMyHistoryTrainings, ITrainingHistoryItem } from '@/api/workout'
import { LegendList } from '@legendapp/list'
import { Colors } from '@/constants/Colors'
import CheckMarkIconSvg from '@/components/svg/CheckMarkIconSvg'
import TrainingsEmpty from '@/components/ui/Post/TrainingsEmpty'
import { useUnsavedWorkoutSync } from '@/hooks/useUnsavedWorkoutSync'
import { cn } from '@/helpers/cn'

interface WorkoutItem {
	id: string
	title: string
	icon: React.ReactElement
	month: string
	startedAt: number
	createdAt: string
	type: string
	showHeader?: boolean
}

const WorkoutHistory = () => {
	const insets = useSafeAreaInsets()
	const { notSavedWorkouts, syncingIds, enqueueWorkoutSync, deleteWorkout } = useUnsavedWorkoutSync()

	// const { user } = useAuthStore()
	// const [notSavedWorkouts, setNotSavedWorkouts] = useState(getNotSavedWorkouts(user?.id))
	const [selectedType, setSelectedType] = useState<string>('')

	// const syncQueueRef = useRef<QueueItem[]>([])
	// const isProcessingRef = useRef(false)
	// const [syncingIds, setSyncingIds] = useState<number[]>([])

	// const enqueueWorkoutSync = (startedAt: number) => {
	// 	if (syncQueueRef.current.some((i) => i.startedAt === startedAt) || syncingIds.includes(startedAt)) return
	//
	// 	syncQueueRef.current.push({
	// 		startedAt,
	// 		userId: user?.id
	// 	})
	//
	// 	processQueue()
	// }

	// const processQueue = async () => {
	// 	if (isProcessingRef.current) return
	//
	// 	const nextWorkout = syncQueueRef.current.shift()
	//
	// 	if (!nextWorkout) {
	// 		isProcessingRef.current = false
	// 		return
	// 	}
	//
	// 	isProcessingRef.current = true
	// 	setSyncingIds((ids) => [...ids, nextWorkout.startedAt])
	//
	// 	try {
	// 		await saveSingleWorkout(nextWorkout.startedAt, nextWorkout.userId)
	// 		setNotSavedWorkouts(getNotSavedWorkouts(user?.id))
	// 	} catch (e) {
	// 		console.error('sync failed', e)
	// 	} finally {
	// 		setSyncingIds((ids) => ids.filter((id) => id !== nextWorkout.startedAt))
	// 		isProcessingRef.current = false
	//
	// 		if (syncQueueRef.current.length) {
	// 			processQueue()
	// 		}
	// 	}
	// }

	// const handleDelete = (startedAt: number) => {
	// 	deleteUnsavedTrainingByStartedAt(startedAt, user?.id)
	// 	setNotSavedWorkouts(getNotSavedWorkouts(user?.id))
	// }

	const limit = 15
	const fetchHistory = useCallback(
		({ page, limit }: { page: number; limit: number }) =>
			getMyHistoryTrainings({ page, limit, finished: true, types: selectedType }),
		[selectedType]
	)
	const {
		data: history,
		loading,
		refreshing,
		loadMore,
		refresh
	} = usePaginatedList<ITrainingHistoryItem, void>({
		fetchFn: fetchHistory,
		limit
	})

	useEffect(() => {
		refresh() // вызываем обновление при смене типа
	}, [selectedType])

	const data: WorkoutItem[] = history
		.map((item) => {
			const date = new Date(item.startedAt || item.createdAt)
			const month = format(date, 'LLLL', { locale: ru })
			const title = format(item.createdAt, 'd MMMM, HH:mm', { locale: ru }) // format(item.createdAt, 'dd-MM-yy, HH:mm')
			const typeData = WorkoutTypesData.find((t) => t.type === item.type)
			const IconComponent = typeData?.IconComponent ?? PeopleRunningSvg

			return {
				id: item.id,
				title,
				month,
				icon: <IconComponent width={26} height={26} />,
				startedAt: date.getTime(),
				createdAt: item.createdAt,
				type: item.type
			}
		})
		.sort((a, b) => b.startedAt - a.startedAt)

	const itemsWithHeaders: WorkoutItem[] = []
	let lastMonth = ''
	data.forEach((item) => {
		const showHeader = item.month !== lastMonth
		itemsWithHeaders.push({ ...item, showHeader })
		lastMonth = item.month
	})

	// Функция рендеринга индикатора загрузки
	const renderFooter = useCallback(() => {
		if (!loading) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [loading])

	const workoutTypeMap = useMemo(() => Object.fromEntries(WorkoutTypesData.map((t) => [t.type, t])), [])

	// @TODO ПОСЛЕ СОХРАНЕНИЯ НЕСОХРАНЕННОЙ ТРЕНИРОВКИ НУЖНО ОБНОВЛЯТЬ СПИСОК СОХРАНЕННЫХ И toast.success('Тренировка сохранена успешно')
	return (
		<View style={{ flex: 1, paddingTop: insets.top }}>
			<Container className="gap-[20px] mt-[20px] flex-1">
				<HeaderBack>История тренировок</HeaderBack>
				<Select
					options={[
						{
							value: '',
							label: 'Все',
							IconComponent: CheckMarkIconSvg
						},
						...WorkoutTypesData.map((t) => ({
							value: t.type,
							label: t.name,
							IconComponent: t.IconComponent
						}))
					]}
					value={selectedType}
					onChange={setSelectedType}
					placeholder="Выберите тип тренировки"
				/>
				<LegendList
					key={selectedType} // если этого не сделать, то при смене на BIKE, который [] length 0 и смене обратно на ходьбу не вызывается loadMore
					style={{ flex: 1 }}
					data={itemsWithHeaders}
					ListEmptyComponent={
						!notSavedWorkouts.length ? (
							<TrainingsEmpty text="К сожалению, тренировок еще не существует" />
						) : null
					}
					refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor="#22CB5A" />}
					ListFooterComponent={renderFooter}
					contentContainerStyle={{
						flexGrow: 1,
						paddingBottom: insets.bottom + 20,
						paddingTop: 10
					}}
					ListHeaderComponent={
						<>
							{notSavedWorkouts?.length > 0 && (
								<Text
									className="text-white text-base mb-[15px]"
									style={{ fontFamily: fontFamily.bold }}
								>
									Несохраненные тренировки
								</Text>
							)}
							<View
								className={cn('', {
									'gap-[16px]': notSavedWorkouts.length
								})}
							>
								{notSavedWorkouts.map((notSavedWorkout) => {
									const date = new Date(notSavedWorkout.startedAt)
									const title = format(date, 'd MMMM, HH:mm', { locale: ru })
									const typeData = workoutTypeMap[notSavedWorkout.type]
									const IconComponent = typeData?.IconComponent ?? PeopleRunningSvg

									const isSyncing = syncingIds.includes(notSavedWorkout.startedAt)

									return (
										<WorkoutHistoryListItem
											key={notSavedWorkout.startedAt}
											title={title}
											icon={<IconComponent width={26} height={26} />}
											isLoading={isSyncing}
											actionIcon={[
												{
													iconSvg: <SaveUnsavedTrainingSvg />,
													iconCb: () => enqueueWorkoutSync(notSavedWorkout.startedAt),
													disabled: isSyncing
												},
												{
													iconSvg: <DeleteTrashSvg />,
													iconCb: () => deleteWorkout(notSavedWorkout.startedAt),
													disabled: isSyncing
												}
											]}
										/>
									)
								})}
							</View>
						</>
					}
					renderItem={({ item }) => (
						<>
							{item.showHeader && (
								<Text
									className="text-white text-base mt-[15px] mb-[15px]"
									style={{ fontFamily: fontFamily.bold }}
								>
									{item.month.charAt(0).toUpperCase() + item.month.slice(1)}
								</Text>
							)}
							<WorkoutHistoryListItem {...item} />
						</>
					)}
					ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
					keyExtractor={(item) => item.id}
					onEndReached={loadMore}
					onEndReachedThreshold={0.4}
					refreshing={refreshing}
					onRefresh={refresh}
				/>
			</Container>
		</View>
	)
}

export default WorkoutHistory
