import React, { memo, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { Dimensions, FlatList, View } from 'react-native'
import MapActionButton from '@/components/map/MapActionButton'
import StartButton from '@/components/map/StartButton'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import AllGeolocationPermissions, { AllGeolocationPermissionsHandle } from '@/components/AllGeolocationPermissions'
import BottomSheetResizable, {
	BottomSheetResizableRef
} from '@/components/ui/BottomSheetResizable/BottomSheetResizable'
import WorkoutType from '@/components/WorkoutType'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TrainingType } from '@shared/enums'
import { UserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/UserLocationMarker'
import { Point } from 'react-native-yamap-plus'
import MapComponentSegments, { MapComponentSegmentsHandle } from '@/components/map/MapComponentSegments'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import UnsavedTrainings from '@/components/BottomSheets/UnsavedTrainings'
import {
	assignIdToAnUnsavedWorkout,
	deleteUnsavedTrainingByStartedAt,
	getNotSavedWorkouts,
	getUnsavedWorkoutByStartedAt,
	getWorkoutMeta,
	markUnsavedWorkoutPointsAsSaved
} from '@/store/workoutStorage'
import { finishTraining, startTraining, syncTraining } from '@/api/workout'
import { randomHexColor } from '@/helpers/randomHexColor'
import { prepareLocationsForSync } from '@/helpers/prepareLocationsForSync'
import { chunkArray } from '@/helpers/chunkArray'
import { useToast } from '@/hooks/useToast'
import { useInternetConnectionRef } from '@/hooks/useInternetConnectionRef'
import { useAuthStore } from '@/store/authStore'

export interface IWorkoutModeElement {
	id: number
	name: string
	type: TrainingType
	IconComponent: (props: { color?: string }) => React.JSX.Element
}

interface IProps {
	initialMarkerLocation?: Point | null
	chosenWorkout: IWorkoutModeElement | null
	handleChangeWorkout: (workoutId: number) => void
	handleClickStart: (afterReboot: boolean) => void
	allPermsGranted: () => void
	WorkoutTypesData: IWorkoutModeElement[]
	permissionsRef: React.RefObject<AllGeolocationPermissionsHandle | null>
	mapComponentRef: React.RefObject<MapComponentSegmentsHandle | null>
	userLocationMarkerRef: React.RefObject<UserLocationMarkerHandle | null>
	latestUserMarkerLocationRef?: RefObject<Point | null>
}

const { height: SCREEN_HEIGHT } = Dimensions.get('screen')
const { height: WINDOW_HEIGHT } = Dimensions.get('window')

const NewWorkout = memo((props: IProps) => {
	const { user } = useAuthStore()
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const unsavedWorkoutsShownRef = useRef<boolean>(false)
	const isSyncInProgressRef = useRef<boolean>(false)
	const [isSaving, setIsSaving] = useState(false)
	const isInternetConnectedRef = useInternetConnectionRef()
	const [notSavedWorkoutsCount, setNotSavedWorkoutsCount] = useState(0)

	const openBottomSheet = useCallback(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current.openSheet()
		}
	}, [])

	useEffect(() => {
		if (unsavedWorkoutsShownRef.current || !isInternetConnectedRef.current) return

		const meta = getWorkoutMeta(user?.id)
		if (meta) return

		const notSavedWorkouts = getNotSavedWorkouts(user?.id)

		if (notSavedWorkouts.length === 0) return
		setNotSavedWorkoutsCount(notSavedWorkouts.length)
		openBottomSheet()
		unsavedWorkoutsShownRef.current = true
	}, [isInternetConnectedRef, isInternetConnectedRef.current, openBottomSheet])

	useEffect(() => {
		return () => {
			unsavedWorkoutsShownRef.current = false
		}
	}, [])

	const closeBottomSheet = useCallback(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current?.closeSheet()
		}
	}, [])

	const bottomSheetResizableRef = useRef<BottomSheetResizableRef>(null)

	const toggleResizableSheet = useCallback(() => {
		const isSheetActive = bottomSheetResizableRef.current?.isActive?.()
		bottomSheetResizableRef?.current?.scrollTo?.(isSheetActive ? 0 : -200)
	}, [])

	const handleChangeWorkout = (workoutId: number) => {
		toggleResizableSheet()
		props.handleChangeWorkout(workoutId)
	}

	const renderIcon = (IconComponent: React.ComponentType<any>, color?: string) => {
		return <IconComponent color={color} />
	}

	const saveUnsavedTrainings = async () => {
		if (!isInternetConnectedRef.current) {
			console.warn('[sync] No internet, skip sync')
			toast.error('Нет доступа к интернету, сохранение невозможно')
			return closeBottomSheet()
		}

		if (isSyncInProgressRef.current || isSaving) return

		isSyncInProgressRef.current = true
		setIsSaving(true)

		try {
			const notSavedWorkouts = getNotSavedWorkouts(user?.id)

			for (const initialWorkout of notSavedWorkouts) {
				let trainingId = initialWorkout.id

				// 1. Создание тренировки на сервере (если нужно)
				if (!trainingId) {
					try {
						const newTraining = await startTraining({
							type: initialWorkout.type,
							colorHex: randomHexColor(),
							ts: initialWorkout.startedAt
						})

						trainingId = newTraining.id
						assignIdToAnUnsavedWorkout(initialWorkout.startedAt, trainingId, user?.id)
					} catch {
						toast.error('Произошла ошибка при старте тренировки')
					}
				}

				while (true) {
					const workout = getUnsavedWorkoutByStartedAt(initialWorkout.startedAt, user?.id)
					if (!workout) break

					const unsavedPoints = workout.locations.filter((point) => !point.isSavedToServer)

					// 2. Все точки уже сохранены
					if (unsavedPoints.length === 0) {
						try {
							const result = await finishTraining({
								ts: workout.locations[workout.locations.length - 1].relTs + workout.startedAt
							})
							if (result.success) {
								deleteUnsavedTrainingByStartedAt(workout.startedAt, user?.id)
							}
						} catch (e) {
							console.error('[sync] finishTraining failed', e)
							toast.error('Произошла ошибка при завершении тренировки')
						}
						break
					}

					// 3. Берём первый батч из текущего состояния
					const [batch] = chunkArray(unsavedPoints)

					const syncResult = await syncTraining(trainingId, prepareLocationsForSync(batch))

					if (!syncResult?.success) {
						console.warn('[sync] Training partially synced, will retry later:', workout.startedAt)
						break
					}

					const prevCount = unsavedPoints.length
					// 4. Маркируем успешно сохранённые точки
					markUnsavedWorkoutPointsAsSaved(
						workout.startedAt,
						batch.map((p) => p.pointId),
						user?.id
					)

					const updated = getUnsavedWorkoutByStartedAt(workout.startedAt, user?.id)
					const nextCount = updated?.locations.filter((p) => !p.isSavedToServer).length ?? 0

					if (nextCount >= prevCount) {
						console.error('[sync] No progress, abort loop')
						break
					}
				}
			}

			toast.success('Тренировка успешно сохранена')
			closeBottomSheet()
		} catch (e) {
			if (!e.response) {
				toast.error('Нет доступа к интернету, сохранение невозможно')
				return
			}
			console.error('[sync] Unexpected error', e)
			toast.error('Ошибка при сохранении тренировки')
		} finally {
			isSyncInProgressRef.current = false
			setIsSaving(false)
		}
	}

	const deleteUnsavedWorkouts = () => {
		const notSavedWorkouts = getNotSavedWorkouts(user?.id)
		for (const notSavedWorkout of notSavedWorkouts) {
			deleteUnsavedTrainingByStartedAt(notSavedWorkout.startedAt, user?.id)
		}
		toast.success('Все несохраненные тренировки удалены успешно')
		closeBottomSheet()
	}

	return (
		<>
			<Container>
				<HeaderBack className="my-[20px]">Новая тренировка</HeaderBack>
			</Container>
			<MapComponentSegments
				ref={props.mapComponentRef}
				userLocationMarkerRef={props.userLocationMarkerRef}
				latestUserMarkerLocationRef={props.latestUserMarkerLocationRef}
				initialMarkerLocation={props.initialMarkerLocation}
				maxMapHeight={WINDOW_HEIGHT}
				maxContainerHeight={WINDOW_HEIGHT}
			/>
			<View
				style={{
					bottom: insets.bottom + 35,
					zIndex: 1,
					elevation: 1
				}}
				pointerEvents="box-none"
				className="-translate-x-[50%] left-[50%] absolute flex-row justify-around items-center w-full"
			>
				<MapActionButton onPress={toggleResizableSheet}>
					{props.chosenWorkout && renderIcon(props.chosenWorkout.IconComponent, '#fff')}
					{/*<SneakerSvg />*/}
				</MapActionButton>
				<StartButton onPress={() => props.handleClickStart(false)}>Начать</StartButton>
				<MapActionButton onPress={() => router.navigate('/find-people')}>
					<PeopleAddSvg />
				</MapActionButton>
			</View>
			<AllGeolocationPermissions
				ref={props.permissionsRef}
				allPermissionsGrantedCallback={props.allPermsGranted}
			/>
			<BottomSheet ref={bottomSheetRef} activeHeight={SCREEN_HEIGHT * 0.5}>
				<UnsavedTrainings
					unsavedTrainingsCount={notSavedWorkoutsCount}
					isSaving={isSaving}
					handleClickClose={closeBottomSheet}
					handleClickSave={saveUnsavedTrainings}
					handleClickDelete={deleteUnsavedWorkouts}
				/>
			</BottomSheet>
			<BottomSheetResizable ref={bottomSheetResizableRef}>
				<Container className="flex-1">
					<FlatList
						data={props.WorkoutTypesData}
						renderItem={({ item }) => (
							<WorkoutType
								id={item.id}
								handleChange={handleChangeWorkout}
								icon={(color) => renderIcon(item.IconComponent, color)}
								name={item.name}
							/>
						)}
						keyExtractor={(_, idx) => idx.toString()}
						ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
						ListFooterComponent={<View style={{ height: insets.bottom + insets.top + 72 }} />}
						nestedScrollEnabled
						showsVerticalScrollIndicator={false}
					/>
				</Container>
			</BottomSheetResizable>
		</>
	)
})

NewWorkout.displayName = 'NewWorkout'

export default NewWorkout
