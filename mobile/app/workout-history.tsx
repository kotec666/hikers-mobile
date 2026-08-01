import React, { useCallback, useMemo, useRef, useState } from 'react'
import { View, Text, RefreshControl, ActivityIndicator, Pressable } from 'react-native'
import HeaderBack from '@/components/ui/HeaderBack'
import { Container } from '@/components/ui/Container'
import PeopleRunningSvg from '@/components/svg/PeopleRunningSvg'
import WorkoutHistoryListItem from '@/components/workout-history/WorkoutHistoryListItem'
import { fontFamily } from '@/constants/Fonts'
import { WorkoutTypesData } from '@/constants/WorkoutTypes'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import SaveUnsavedTrainingSvg from '@/components/svg/SaveUnsavedTrainingSvg'
import DeleteTrashSvg from '@/components/svg/DeleteTrashSvg'
import SwipeableProvider from '@/components/providers/SwipeableProvider'
import { Colors } from '@/constants/Colors'
import CheckMarkIconSvg from '@/components/svg/CheckMarkIconSvg'
import TrainingsEmpty from '@/components/ui/Post/TrainingsEmpty'
import { useUnsavedWorkoutSync } from '@/hooks/useUnsavedWorkoutSync'
import { cn } from '@/helpers/cn'
import { useToast } from '@/hooks/useToast'
import { formatDistance } from '@/helpers/distance'
import { useWorkoutsQuery } from '@/queries/workout'
import { Page } from '@/components/ui/Page'
import BlurProvider from '@/components/providers/BlurProvider'
import ArrowDownSvg from '@/components/svg/ArrowDownSvg'
import BaseWheelPicker from '@/components/ui/wheel-picker/base-wheel-picker'
import { refetchAndHaptics } from '@/helpers/refetchAndHaptics'
import { FlashList, FlashListRef } from '@shopify/flash-list'
import BottomSheet, { BottomSheetHandle } from '@/components/ui/BottomSheet/BottomSheet'
import LoadQueryErrorRetry from '@/components/LoadQueryErrorRetry'
import { WorkoutHistoryListSkeleton } from '@/components/ui/skeleton'

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
	const toast = useToast()
	const listRef = useRef<FlashListRef<WorkoutHistoryRow>>(null)
	const bottomSheetRef = useRef<BottomSheetHandle>(null)

	const { notSavedWorkouts, syncingIds, enqueueWorkoutSync, deleteWorkout } = useUnsavedWorkoutSync()

	const [selectedType, setSelectedType] = useState<string>('')
	const [temporarySelectedType, setTemporarySelectedType] = useState<string>('')
	const [deletedWorkoutIds, setDeletedWorkoutIds] = useState<string[]>([])

	const {
		data: history = [],
		isRefetching,
		fetchNextPage,
		refetch,
		isLoading,
		isError,
		hasNextPage,
		isFetchingNextPage
	} = useWorkoutsQuery(selectedType)

	const handleRetry = useCallback(() => {
		return refetch()
	}, [refetch])

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

	const openBottomSheet = useCallback(async () => {
		setTemporarySelectedType(selectedType)
		if (bottomSheetRef.current) {
			await bottomSheetRef.current.openSheet()
		}
	}, [selectedType])

	const workoutTypePickerWheelData = useMemo(() => {
		return [
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
		]
	}, [])

	const workoutTypeLabelMap = useMemo(() => {
		return Object.fromEntries(workoutTypePickerWheelData.map((item) => [item.value, item.label]))
	}, [workoutTypePickerWheelData])

	// Функция рендеринга индикатора загрузки
	const renderFooter = useCallback(() => {
		if (isError && data.length > 0) {
			return <LoadQueryErrorRetry text="Не удалось загрузить ещё" buttonText="Повторить" onRetry={handleRetry} />
		}
		if (!isFetchingNextPage) return null
		return (
			<View style={{ padding: 20 }}>
				<ActivityIndicator size="small" color={Colors['green-main']} />
			</View>
		)
	}, [isFetchingNextPage, isError, data.length, handleRetry])

	const renderEmpty = useCallback(() => {
		if (isLoading || notSavedWorkouts.length > 0) return <WorkoutHistoryListSkeleton />

		if (isError) {
			return <LoadQueryErrorRetry text="Не удалось загрузить историю тренировок" onRetry={handleRetry} />
		}

		return <TrainingsEmpty text="К сожалению, тренировок еще не существует" />
	}, [isLoading, notSavedWorkouts.length, isError, handleRetry])

	return (
		<Page>
			<BlurProvider>
				<BottomSheet
					ref={bottomSheetRef}
					dimmed={false}
					onDone={async () => {
						bottomSheetRef.current?.closeSheet()
						await handleSelectType(temporarySelectedType)
					}}
				>
					<BaseWheelPicker
						data={workoutTypePickerWheelData}
						value={temporarySelectedType}
						onChange={(type: string) => setTemporarySelectedType(type)}
						itemHeight={70}
						renderItem={({ item, index }) => {
							const Icon = item.IconComponent ?? PeopleRunningSvg
							const isChosen = temporarySelectedType === item.value

							return (
								<View key={index} className="p-3">
									<WorkoutHistoryListItem
										icon={<Icon width={26} height={26} />}
										title={item.label}
										isChosen={isChosen}
									/>
								</View>
							)
						}}
					/>
				</BottomSheet>
				<Container className="gap-[20px] flex-1">
					<HeaderBack>История тренировок</HeaderBack>
					<Pressable
						className="border border-black-44 text-white h-[50px] rounded-full relative flex-row items-center justify-between px-4"
						onPress={openBottomSheet}
					>
						<Text
							style={{
								fontFamily: fontFamily.regular
							}}
							className="text-sm mr-2 text-white"
							numberOfLines={1}
						>
							{workoutTypeLabelMap[selectedType] ?? 'Все'}
						</Text>
						<ArrowDownSvg />
					</Pressable>
					<FlashList
						ref={listRef}
						style={{ flex: 1 }}
						data={itemsWithHeaders}
						ListEmptyComponent={renderEmpty}
						refreshControl={
							<RefreshControl
								refreshing={isRefetching}
								onRefresh={() => refetchAndHaptics(handleRetry)}
								tintColor={Colors['green-main']}
							/>
						}
						ListFooterComponent={renderFooter}
						contentContainerStyle={{
							flexGrow: 1,
							paddingBottom: 10,
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
			</BlurProvider>
		</Page>
	)
}

export default WorkoutHistory
