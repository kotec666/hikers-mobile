import React, {
	forwardRef,
	memo,
	RefObject,
	useCallback,
	useEffect,
	useImperativeHandle,
	useRef,
	useState
} from 'react'
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
import { BottomSheetHandle } from '@/components/ui/BottomSheet/types'
import BottomSheet from '@/components/ui/BottomSheet/BottomSheet'
import UnsavedTrainings from '@/components/BottomSheets/UnsavedTrainings'
import { getNotSavedWorkouts, getWorkoutMeta } from '@/store/workoutStorage'
import { useToast } from '@/hooks/useToast'
import { useInternetConnection } from '@/hooks/useInternetConnection'
import { useAuthStore } from '@/store/authStore'
import UnsavedTrainingsDetails from '@/components/BottomSheets/UnsavedTrainingsDetails'
import { useUnsavedWorkoutSync } from '@/hooks/useUnsavedWorkoutSync'
import NotFinishedWorkout from '@/components/BottomSheets/NotFinishedWorkout'
import { deleteNotFinishedTraining } from '@/api/workout'
import { IPoint } from '@/types/interfaces'
import YaMapWorkout, { YaMapWorkoutHandle } from '@/components/map/YaMapWorkout'
import RNMapWorkout, { RNMapWorkoutHandle } from '@/components/map/RNMapWorkout'
import { YaMapUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'
import { RNMapsUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'

export interface IWorkoutModeElement {
	name: string
	type: TrainingType
	IconComponent: (props: { color?: string }) => React.JSX.Element
}

interface IProps {
	initialMarkerLocation?: IPoint | null
	chosenWorkout: IWorkoutModeElement | null
	handleChangeWorkout: (workoutType: TrainingType) => void
	handleClickStart: (afterReboot: boolean) => void
	allPermsGranted: () => void
	WorkoutTypesData: IWorkoutModeElement[]
	permissionsRef: React.RefObject<AllGeolocationPermissionsHandle | null>
	yaMapComponentRef: React.RefObject<YaMapWorkoutHandle | null>
	yaMapUserLocationMarkerRef: React.RefObject<YaMapUserLocationMarkerHandle | null>
	rnMapComponentRef: React.RefObject<RNMapWorkoutHandle | null>
	rnMapUserLocationMarkerRef: React.RefObject<RNMapsUserLocationMarkerHandle | null>
	latestUserMarkerLocationRef?: RefObject<IPoint | null>
}

const { height: SCREEN_HEIGHT } = Dimensions.get('screen')
const { height: WINDOW_HEIGHT } = Dimensions.get('window')

export interface NewWorkoutHandle {
	toggleBottomSheetOnNewWorkout: () => void
}

type ResizableSheetContent = 'workouts' | 'unsavedDetails'
type BottomSheetContent = 'unsavedTrainings' | 'notFinishedWorkout'

const NewWorkout = memo(
	forwardRef<NewWorkoutHandle, IProps>((props, ref) => {
		const { handleChangeWorkout: onChangeWorkout } = props
		const { user } = useAuthStore()
		const router = useRouter()
		const isIOS = Platform.OS === 'ios'
		const insets = useSafeAreaInsets()
		const toast = useToast()
		const bottomSheetRef = useRef<BottomSheetHandle>(null)
		const bottomSheetResizableRef = useRef<BottomSheetResizableRef>(null)
		const unsavedWorkoutsShownRef = useRef<boolean>(false)
		const { isConnected: isInternetConnected } = useInternetConnection()
		const [notSavedWorkoutsCount, setNotSavedWorkoutsCount] = useState(0)
		const [sheetContent, setSheetContent] = useState<ResizableSheetContent>('workouts')
		const [bottomSheetContent, setBottomSheetContent] = useState<BottomSheetContent>('unsavedTrainings')

		const closeResizableSheet = useCallback(() => {
			bottomSheetResizableRef.current?.close()
		}, [])

		const openBottomSheet = useCallback((content: BottomSheetContent = 'unsavedTrainings') => {
			setBottomSheetContent(content)
			if (bottomSheetRef.current) {
				bottomSheetRef.current.openSheet()
			}
		}, [])

		const toggleBottomSheetOnNewWorkout = useCallback(() => {
			closeResizableSheet()
			openBottomSheet('notFinishedWorkout')
		}, [closeResizableSheet, openBottomSheet])

		useImperativeHandle(
			ref,
			() => ({
				toggleBottomSheetOnNewWorkout
			}),
			[toggleBottomSheetOnNewWorkout]
		)

		// Проверка на наличие несохраненных тренировок
		useFocusEffect(
			useCallback(() => {
				if (unsavedWorkoutsShownRef.current || !isInternetConnected) return

				const meta = getWorkoutMeta(user?.id)
				if (meta) return

				const notSavedWorkouts = getNotSavedWorkouts(user?.id)

				if (notSavedWorkouts.length === 0) return
				setNotSavedWorkoutsCount(notSavedWorkouts.length)
				openBottomSheet('unsavedTrainings')
				unsavedWorkoutsShownRef.current = true
			}, [isInternetConnected, openBottomSheet, user?.id])
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

		const toggleResizableSheet = useCallback(() => {
			const isSheetActive = bottomSheetResizableRef.current?.isActive?.()
			if (isSheetActive) {
				return bottomSheetResizableRef.current?.close()
			} else {
				return bottomSheetResizableRef.current?.open()
			}
			// bottomSheetResizableRef?.current?.scrollTo?.(isSheetActive ? 0 : -200)
		}, [])

		const handleChangeWorkout = useCallback(
			(workoutType: TrainingType) => {
				toggleResizableSheet()
				onChangeWorkout(workoutType)
			},
			[onChangeWorkout, toggleResizableSheet]
		)

		const renderIcon = (IconComponent: React.ComponentType<any>, color?: string) => {
			return <IconComponent color={color} />
		}

		const handleClickDetails = useCallback(() => {
			closeBottomSheet()
			setSheetContent('unsavedDetails')
			toggleResizableSheet()
		}, [closeBottomSheet, toggleResizableSheet])

		const toggleWorkoutTypeSheet = useCallback(() => {
			toggleResizableSheet()
			setSheetContent('workouts')
		}, [toggleResizableSheet])

		const { deleteAll, notSavedWorkouts, syncingIds, enqueueWorkoutSync, deleteWorkout, saveAll } =
			useUnsavedWorkoutSync()

		const saveUnsavedTrainings = useCallback(async () => {
			try {
				await saveAll()
				toast.success(notSavedWorkoutsCount === 1 ? 'Тренировка сохранена' : 'Все тренировки сохранены')
			} catch {
				toast.error('Не удалось сохранить все тренировки')
			} finally {
				closeBottomSheet()
				closeResizableSheet()
			}
		}, [closeBottomSheet, closeResizableSheet, notSavedWorkoutsCount, saveAll, toast])

		const handleClickSaveOneWorkout = useCallback(
			async (startedAt: number) => {
				try {
					await enqueueWorkoutSync(startedAt)
					toast.success('Тренировка сохранена успешно')
				} catch {
					toast.error('Не удалось сохранить тренировку')
				}
			},
			[enqueueWorkoutSync, toast]
		)

		const handleClickDeleteWorkout = useCallback(
			async (startedAt: number) => {
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
			},
			[closeResizableSheet, deleteWorkout, notSavedWorkoutsCount, toast]
		)

		const handleRestoreAndContinueNotFinishedWorkout = useCallback(() => {
			toast.error('восстановление еще не реализовано')
			closeBottomSheet()
		}, [closeBottomSheet, toast])

		const handleDeleteNotFinishedWorkout = useCallback(async () => {
			try {
				await deleteNotFinishedTraining()
			} catch (e) {
				console.log('deleteNotFinishedTraining error:', e)
			} finally {
				closeBottomSheet()
			}
		}, [closeBottomSheet])

		const deleteUnsavedWorkouts = useCallback(async () => {
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
		}, [closeBottomSheet, closeResizableSheet, deleteAll, toast])

		return (
			<>
				<Container className="mb-[20px]">
					<HeaderBack>Новая тренировка</HeaderBack>
				</Container>
				{isIOS ? (
					<RNMapWorkout
						ref={props.rnMapComponentRef}
						userLocationMarkerRef={props.rnMapUserLocationMarkerRef}
						latestUserMarkerLocationRef={props.latestUserMarkerLocationRef}
						initialMarkerLocation={props.initialMarkerLocation}
						// maxContainerHeight={WINDOW_HEIGHT}
					/>
				) : (
					<YaMapWorkout
						ref={props.yaMapComponentRef}
						userLocationMarkerRef={props.yaMapUserLocationMarkerRef}
						latestUserMarkerLocationRef={props.latestUserMarkerLocationRef}
						initialMarkerLocation={props.initialMarkerLocation}
						maxContainerHeight={WINDOW_HEIGHT}
					/>
				)}
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
					</MapActionButton>
					<StartButton onPress={() => props.handleClickStart(false)}>Начать</StartButton>
					<MapActionButton onPress={() => router.navigate('/find-people')} className="hidden">
						<PeopleAddSvg />
					</MapActionButton>
					<View pointerEvents="none" className="w-[58px] h-[58px]" />
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
					{bottomSheetContent === 'unsavedTrainings' && (
						<UnsavedTrainings
							unsavedTrainingsCount={notSavedWorkoutsCount}
							isSaving={Boolean(syncingIds.length)}
							handleClickSave={saveUnsavedTrainings}
							handleClickDelete={deleteUnsavedWorkouts}
							handleClickDetails={handleClickDetails}
							handleClickClose={closeBottomSheet}
						/>
					)}
					{bottomSheetContent === 'notFinishedWorkout' && (
						<NotFinishedWorkout
							restoreAndContinue={handleRestoreAndContinueNotFinishedWorkout}
							deleteNotFinishedWorkout={handleDeleteNotFinishedWorkout}
							close={closeBottomSheet}
						/>
					)}
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
)

NewWorkout.displayName = 'NewWorkout'

export default NewWorkout
