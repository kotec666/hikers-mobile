import React, { memo, RefObject, useCallback, useEffect, useRef, useState } from 'react'
import { Container } from '@/components/ui/Container'
import HeaderBack from '@/components/ui/HeaderBack'
import { Dimensions, FlatList, Platform, View } from 'react-native'
import MapActionButton from '@/components/map/MapActionButton'
import StartButton from '@/components/map/StartButton'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import AllGeolocationPermissions, { AllGeolocationPermissionsHandle } from '@/components/AllGeolocationPermissions'
import BottomSheetResizable, {
	BottomSheetResizableRef
} from '@/components/ui/BottomSheetResizable/BottomSheetResizable'
import WorkoutType from '@/components/WorkoutType'
import { useFocusEffect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TrainingType } from '@shared/enums'
import { UserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/UserLocationMarker'
import { Point } from 'react-native-yamap-plus'
import MapComponentSegments, { MapComponentSegmentsHandle } from '@/components/map/MapComponentSegments'
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import UnsavedTrainings from '@/components/BottomSheets/UnsavedTrainings'
import { getNotSavedWorkouts, getWorkoutMeta } from '@/store/workoutStorage'
import { useToast } from '@/hooks/useToast'
import { useInternetConnectionRef } from '@/hooks/useInternetConnectionRef'
import { useAuthStore } from '@/store/authStore'
import UnsavedTrainingsDetails from '@/components/BottomSheets/UnsavedTrainingsDetails'
import { useUnsavedWorkoutSync } from '@/hooks/useUnsavedWorkoutSync'

export interface IWorkoutModeElement {
	name: string
	type: TrainingType
	IconComponent: (props: { color?: string }) => React.JSX.Element
}

interface IProps {
	initialMarkerLocation?: Point | null
	chosenWorkout: IWorkoutModeElement | null
	handleChangeWorkout: (workoutType: TrainingType) => void
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

type ResizableSheetContent = 'workouts' | 'unsavedDetails'

const NewWorkout = memo((props: IProps) => {
	const { user } = useAuthStore()
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const toast = useToast()
	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const unsavedWorkoutsShownRef = useRef<boolean>(false)
	const isInternetConnectedRef = useInternetConnectionRef()
	const [notSavedWorkoutsCount, setNotSavedWorkoutsCount] = useState(0)
	const [sheetContent, setSheetContent] = useState<ResizableSheetContent>('workouts')

	const openBottomSheet = useCallback(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current.openSheet()
		}
	}, [])

	// Проверка на наличие несохраненных тренировок
	useFocusEffect(
		useCallback(() => {
			if (unsavedWorkoutsShownRef.current || !isInternetConnectedRef.current) return

			const meta = getWorkoutMeta(user?.id)
			if (meta) return

			const notSavedWorkouts = getNotSavedWorkouts(user?.id)

			if (notSavedWorkouts.length === 0) return
			setNotSavedWorkoutsCount(notSavedWorkouts.length)
			openBottomSheet()
			unsavedWorkoutsShownRef.current = true
		}, [isInternetConnectedRef, isInternetConnectedRef.current, openBottomSheet, user?.id])
	)

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

	const closeResizableSheet = () => {
		bottomSheetResizableRef.current?.close()
	}

	const bottomSheetResizableRef = useRef<BottomSheetResizableRef>(null)

	const toggleResizableSheet = useCallback(() => {
		const isSheetActive = bottomSheetResizableRef.current?.isActive?.()
		if (isSheetActive) {
			return bottomSheetResizableRef.current?.close()
		} else {
			return bottomSheetResizableRef.current?.open()
		}
		// bottomSheetResizableRef?.current?.scrollTo?.(isSheetActive ? 0 : -200)
	}, [])

	const handleChangeWorkout = (workoutType: TrainingType) => {
		toggleResizableSheet()
		props.handleChangeWorkout(workoutType)
	}

	const renderIcon = (IconComponent: React.ComponentType<any>, color?: string) => {
		return <IconComponent color={color} />
	}

	const handleClickDetails = () => {
		closeBottomSheet()
		setSheetContent('unsavedDetails')
		toggleResizableSheet()
	}

	const toggleWorkoutTypeSheet = () => {
		toggleResizableSheet()
		setSheetContent('workouts')
	}

	const { deleteAll, notSavedWorkouts, syncingIds, enqueueWorkoutSync, deleteWorkout, saveAll } =
		useUnsavedWorkoutSync()

	const saveUnsavedTrainings = async () => {
		try {
			await saveAll()
			toast.success(notSavedWorkoutsCount === 1 ? 'Тренировка сохранена' : 'Все тренировки сохранены')
		} catch {
			toast.error('Не удалось сохранить все тренировки')
		} finally {
			closeBottomSheet()
			closeResizableSheet()
		}
	}

	const handleClickSaveOneWorkout = async (startedAt: number) => {
		try {
			await enqueueWorkoutSync(startedAt)
			toast.success('Тренировка сохранена успешно')
		} catch {
			toast.error('Не удалось сохранить тренировку')
		}
	}

	const handleClickDeleteWorkout = async (startedAt: number) => {
		try {
			await deleteWorkout(startedAt)
			toast.success('Несохраненная тренировка удалена успешно')
		} catch {
			toast.error('Не удалось удалить тренировку')
		} finally {
			unsavedWorkoutsShownRef.current = false
			if (notSavedWorkoutsCount === 1) {
				closeResizableSheet()
			}
		}
	}

	const deleteUnsavedWorkouts = async () => {
		try {
			await deleteAll()
			toast.success('Все несохраненные тренировки удалены успешно')
		} catch {
			toast.error('Не удалось удалить все тренировки')
		} finally {
			unsavedWorkoutsShownRef.current = false
			closeBottomSheet()
			closeResizableSheet()
		}
	}

	return (
		<>
			<Container>
				<HeaderBack className="my-[20px]">Новая тренировка</HeaderBack>
			</Container>
			{/*<MapComponentSegments*/}
			{/*	ref={props.mapComponentRef}*/}
			{/*	userLocationMarkerRef={props.userLocationMarkerRef}*/}
			{/*	latestUserMarkerLocationRef={props.latestUserMarkerLocationRef}*/}
			{/*	initialMarkerLocation={props.initialMarkerLocation}*/}
			{/*	maxMapHeight={WINDOW_HEIGHT}*/}
			{/*	maxContainerHeight={WINDOW_HEIGHT}*/}
			{/*/>*/}
			<View
				style={{
					bottom: insets.bottom + 35,
					zIndex: 1,
					elevation: 1
				}}
				pointerEvents="box-none"
				className="-translate-x-[50%] left-[50%] absolute flex-row justify-around items-center w-full"
			>
				<MapActionButton onPress={toggleWorkoutTypeSheet}>
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
			<BottomSheet
				blurDisabled={Platform.OS === 'android'}
				ref={bottomSheetRef}
				activeHeight={SCREEN_HEIGHT * 0.5}
			>
				<UnsavedTrainings
					unsavedTrainingsCount={notSavedWorkoutsCount}
					isSaving={Boolean(syncingIds.length)}
					handleClickSave={saveUnsavedTrainings}
					handleClickDelete={deleteUnsavedWorkouts}
					handleClickDetails={handleClickDetails}
					handleClickClose={closeBottomSheet}
				/>
			</BottomSheet>
			<BottomSheetResizable ref={bottomSheetResizableRef} blurDisabled={Platform.OS === 'android'}>
				{sheetContent === 'workouts' && (
					<Container className="flex-1">
						<FlatList
							data={props.WorkoutTypesData}
							renderItem={({ item }) => (
								<WorkoutType
									type={item.type}
									handleChange={handleChangeWorkout}
									icon={(color) => renderIcon(item.IconComponent, color)}
									name={item.name}
								/>
							)}
							keyExtractor={(item) => item.type}
							ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
							ListFooterComponent={<View style={{ height: insets.bottom + insets.top + 72 }} />}
							nestedScrollEnabled
							showsVerticalScrollIndicator={false}
						/>
					</Container>
				)}
				{sheetContent === 'unsavedDetails' && (
					<UnsavedTrainingsDetails
						syncingIds={syncingIds}
						notSavedWorkouts={notSavedWorkouts}
						handleClickSaveOneWorkout={handleClickSaveOneWorkout}
						handleClickDelete={handleClickDeleteWorkout}
						handleClickDeleteAll={deleteUnsavedWorkouts}
					/>
				)}
			</BottomSheetResizable>
		</>
	)
})

NewWorkout.displayName = 'NewWorkout'

export default NewWorkout
