import React, { useCallback, useMemo, useRef, useState } from 'react'
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
import SwipeableProvider from '@/components/providers/SwipeableProvider'
import { LegendList, LegendListRef } from '@legendapp/list'
import { Colors } from '@/constants/Colors'
import CheckMarkIconSvg from '@/components/svg/CheckMarkIconSvg'
import TrainingsEmpty from '@/components/ui/Post/TrainingsEmpty'
import { useUnsavedWorkoutSync } from '@/hooks/useUnsavedWorkoutSync'
import { cn } from '@/helpers/cn'
import { useToast } from '@/hooks/useToast'
import { formatDistance } from '@/helpers/distance'
import { useWorkoutsQuery } from '@/queries/workout'

interface WorkoutItem {
	id: string
	title: string
	icon: React.ReactElement
	month: string
	monthKey: string
	startedAt: number
	createdAt: string
	type: string
	showHeader?: boolean
}

type WorkoutHistoryRow =
	| {
			rowType: 'header'
			id: string
			month: string
	  }
	| ({
			rowType: 'workout'
	  } & WorkoutItem)

const WorkoutHistory = () => {
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const listRef = useRef<LegendListRef>(null)

	const { notSavedWorkouts, syncingIds, enqueueWorkoutSync, deleteWorkout } = useUnsavedWorkoutSync()

	const [selectedType, setSelectedType] = useState<string>('')
	const [deletedWorkoutIds, setDeletedWorkoutIds] = useState<string[]>([])

	const {
		data: history = [],
		isRefetching,
		fetchNextPage,
		refetch,
		hasNextPage,
		isFetchingNextPage
	} = useWorkoutsQuery(selectedType)

	const data: WorkoutItem[] = history
		.filter((item) => !deletedWorkoutIds.includes(item.id))
		.map((item) => {
			const date = new Date(item.startedAt || item.createdAt)
			const month = format(date, 'LLLL', { locale: ru })
			const monthKey = format(date, 'yyyy-MM')
			const title = format(date, 'd MMMM, HH:mm', { locale: ru }) // format(item.createdAt, 'dd-MM-yy, HH:mm')
			const typeData = WorkoutTypesData.find((t) => t.type === item.type)
			const IconComponent = typeData?.IconComponent ?? PeopleRunningSvg

			const distance = Number(item?.distanceM)
			return {
				id: item.id,
				title: `${title}${Number.isFinite(distance) && distance >= 0 ? `, ${formatDistance(distance)}` : ''}`,
				month,
				monthKey,
				icon: <IconComponent width={26} height={26} />,
				startedAt: date.getTime(),
				createdAt: item.createdAt,
				type: item.type
			}
		})
		.sort((a, b) => b.startedAt - a.startedAt)

	const itemsWithHeaders: WorkoutHistoryRow[] = []
	let lastMonthKey = ''
	data.forEach((item) => {
		if (item.monthKey !== lastMonthKey) {
			itemsWithHeaders.push({
				rowType: 'header',
				id: `header-${item.monthKey}`,
				month: item.month
			})
			lastMonthKey = item.monthKey
		}

		itemsWithHeaders.push({ ...item, rowType: 'workout' })
	})

	// Функция рендеринга индикатора загрузки
	const renderFooter = useCallback(() => {
		if (!isFetchingNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [isFetchingNextPage])

	const workoutTypeMap = useMemo(() => Object.fromEntries(WorkoutTypesData.map((t) => [t.type, t])), [])

	const handleDelete = async (startedAt: number) => {
		try {
			await deleteWorkout(startedAt)
			toast.success('Тренировка удалена')
		} catch {}
	}

	const handleDeleteSavedWorkout = (id: string) => {
		setDeletedWorkoutIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
	}

	const handleSync = async (startedAt: number) => {
		try {
			await enqueueWorkoutSync(startedAt)
			toast.success('Тренировка сохранена успешно')
		} catch (e) {
			console.log(e)
			toast.error('Не удалось сохранить тренировку')
		}
	}

	const handleSelectType = async (type: string) => {
		setSelectedType(type)
		listRef.current?.scrollToOffset({
			offset: 0,
			animated: false
		})
	}

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
					onChange={(type: string) => handleSelectType(type)}
					placeholder="Выберите тип тренировки"
				/>
				<LegendList
					ref={listRef}
					style={{ flex: 1 }}
					data={itemsWithHeaders}
					ListEmptyComponent={
						!notSavedWorkouts.length ? (
							<TrainingsEmpty text="К сожалению, тренировок еще не существует" />
						) : null
					}
					refreshControl={
						<RefreshControl
							refreshing={isRefetching}
							onRefresh={refetch}
							tintColor={Colors['green-main']}
						/>
					}
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
									const titleDate = format(date, 'd MMMM, HH:mm', {
										locale: ru
									})
									const title = `${titleDate}${Number.isFinite(notSavedWorkout.distanceMeters) && notSavedWorkout.distanceMeters >= 0 ? `, ${formatDistance(notSavedWorkout.distanceMeters)}` : ''}`
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
													iconCb: () => handleSync(notSavedWorkout.startedAt),
													disabled: isSyncing
												},
												{
													iconSvg: <DeleteTrashSvg />,
													iconCb: () => handleDelete(notSavedWorkout.startedAt),
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
						<View>
							{item.rowType === 'header' ? (
								<Text
									className="text-white text-base mt-[15px] mb-[15px]"
									style={{ fontFamily: fontFamily.bold }}
								>
									{item.month.charAt(0).toUpperCase() + item.month.slice(1)}
								</Text>
							) : (
								<SwipeableProvider
									variant="action"
									actionWidth={64}
									bottomSpacing={16}
									cardBackgroundColor={Colors['black-0d']}
									onActionPress={() => handleDeleteSavedWorkout(item.id)}
								>
									<WorkoutHistoryListItem isHistoryListItem {...item} />
								</SwipeableProvider>
							)}
						</View>
					)}
					keyExtractor={(item) => item.id}
					onEndReached={() => {
						if (hasNextPage && !isFetchingNextPage) {
							fetchNextPage()
						}
					}}
					onEndReachedThreshold={0.4}
				/>
			</Container>
		</View>
	)
}

export default WorkoutHistory
