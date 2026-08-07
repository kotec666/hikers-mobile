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
import { Dimensions, Platform, View } from 'react-native'
import MapActionButton from '@/components/map/MapActionButton'
import StartButton from '@/components/map/StartButton'
import PeopleAddSvg from '@/components/svg/PeopleAddSvg'
import AllGeolocationPermissions, { AllGeolocationPermissionsHandle } from '@/components/AllGeolocationPermissions'
import WorkoutType from '@/components/WorkoutType'
import { useFocusEffect, useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { TrainingType } from '@shared/enums'
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
import { YaMapWorkoutHandle } from '@/components/map/YaMapWorkout'
import { RNMapWorkoutHandle } from '@/components/map/RNMapWorkout'
import { YaMapUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'
import { RNMapsUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'
import WorkoutMap from '@/components/map/WorkoutMap'
import BatteryOptimizationBanner from '@/components/training/BatteryOptimizationBanner'
import { FlashList } from '@shopify/flash-list'
import BottomSheet, { BottomSheetHandle } from '@/components/ui/BottomSheet/BottomSheet'
import { useTranslation } from 'react-i18next'

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

const { height: WINDOW_HEIGHT } = Dimensions.get('window')

export interface NewWorkoutHandle {
	toggleBottomSheetOnNewWorkout: () => void
}

enum BottomSheetContent {
	unsavedTrainings = 'unsavedTrainings',
	notFinishedWorkout = 'notFinishedWorkout',
	workouts = 'workouts',
	unsavedDetails = 'unsavedDetails'
}

const NewWorkout = memo(
	forwardRef<NewWorkoutHandle, IProps>((props, ref) => {
		const { t } = useTranslation()
		const { handleChangeWorkout: onChangeWorkout } = props
		const { user } = useAuthStore()
		const isIOS = Platform.OS === 'ios'
		const router = useRouter()
		const insets = useSafeAreaInsets()
		const toast = useToast()
		const bottomSheetRef = useRef<BottomSheetHandle>(null)
		const unsavedWorkoutsShownRef = useRef<boolean>(false)
		const { isConnected: isInternetConnected } = useInternetConnection()
		const [notSavedWorkoutsCount, setNotSavedWorkoutsCount] = useState(0)
		const [bottomSheetContent, setBottomSheetContent] = useState<BottomSheetContent>(BottomSheetContent.workouts)

		const openBottomSheet = useCallback(
			async (content: BottomSheetContent = BottomSheetContent.unsavedTrainings) => {
				setBottomSheetContent(content)
				if (bottomSheetRef.current) {
					await bottomSheetRef.current.openSheet()
				}
			},
			[]
		)

		const closeBottomSheet = useCallback(async () => {
			if (bottomSheetRef.current) {
				await bottomSheetRef.current?.closeSheet()
			}
		}, [])

		const toggleBottomSheetOnNewWorkout = useCallback(async () => {
			await openBottomSheet(BottomSheetContent.notFinishedWorkout)
		}, [openBottomSheet])

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
				openBottomSheet(BottomSheetContent.unsavedTrainings)
				unsavedWorkoutsShownRef.current = true
			}, [isInternetConnected, openBottomSheet, user?.id])
		)

		useEffect(() => {
			return () => {
				unsavedWorkoutsShownRef.current = false
			}
		}, [])

		const handleChangeWorkout = useCallback(
			async (workoutType: TrainingType) => {
				await closeBottomSheet()
				onChangeWorkout(workoutType)
			},
			[onChangeWorkout, closeBottomSheet]
		)

		const renderIcon = (IconComponent: React.ComponentType<any>, color?: string) => {
			return <IconComponent color={color} />
		}

		const handleClickDetails = useCallback(async () => {
			await openBottomSheet(BottomSheetContent.unsavedDetails)
		}, [openBottomSheet])

		const toggleWorkoutTypeSheet = useCallback(async () => {
			await openBottomSheet(BottomSheetContent.workouts)
		}, [openBottomSheet])

		const { deleteAll, notSavedWorkouts, syncingIds, enqueueWorkoutSync, deleteWorkout, saveAll } =
			useUnsavedWorkoutSync()

		const saveUnsavedTrainings = useCallback(async () => {
			try {
				await saveAll()
				toast.success(
					notSavedWorkoutsCount === 1
						? t('ToastMessage.success.workoutSaved') // Тренировка сохранена
						: t('ToastMessage.success.allWorkoutsSaved') // Все тренировки сохранены
				)
			} catch {
				toast.error(t('ToastMessage.error.failedToSaveAllWorkouts'))
			} finally {
				await closeBottomSheet()
			}
		}, [closeBottomSheet, notSavedWorkoutsCount, saveAll, t, toast])

		const handleClickSaveOneWorkout = useCallback(
			async (startedAt: number) => {
				try {
					await enqueueWorkoutSync(startedAt)
					toast.success(t('ToastMessage.success.workoutWasSavedSuccessfully'))
				} catch {
					toast.error(t('ToastMessage.error.failedToSaveWorkout'))
				}
			},
			[enqueueWorkoutSync, t, toast]
		)

		const handleClickDeleteWorkout = useCallback(
			async (startedAt: number) => {
				try {
					await deleteWorkout(startedAt)
					toast.success(t('ToastMessage.success.unsavedWorkoutDeletedSuccessfully'))
				} catch {
					toast.error(t('ToastMessage.error.failedToDeleteWorkout'))
				} finally {
					unsavedWorkoutsShownRef.current = false
					if (notSavedWorkoutsCount === 1) {
						await closeBottomSheet()
					}
				}
			},
			[closeBottomSheet, deleteWorkout, notSavedWorkoutsCount, t, toast]
		)

		const handleRestoreAndContinueNotFinishedWorkout = useCallback(async () => {
			toast.error('восстановление еще не реализовано')
			await closeBottomSheet()
		}, [closeBottomSheet, toast])

		const handleDeleteNotFinishedWorkout = useCallback(async () => {
			try {
				await deleteNotFinishedTraining()
			} catch (e) {
				console.log('deleteNotFinishedTraining error:', e)
			} finally {
				await closeBottomSheet()
			}
		}, [closeBottomSheet])

		const deleteUnsavedWorkouts = useCallback(async () => {
			try {
				await deleteAll()
				toast.success(t('ToastMessage.success.allUnsavedWorkoutsHaveBeenDeletedSuccessfully'))
			} catch {
				toast.error(t('ToastMessage.error.failedToDeleteAllWorkouts'))
			} finally {
				unsavedWorkoutsShownRef.current = false
				await closeBottomSheet()
			}
		}, [closeBottomSheet, deleteAll, t, toast])

		return (
			<>
				<Container className="mb-[20px]">
					<HeaderBack>{t('WorkoutPage.header.newWorkout')}</HeaderBack>
				</Container>
				<BatteryOptimizationBanner />
				<WorkoutMap
					key={user?.color}
					routeColor={user?.color}
					rnMapComponentRef={props.rnMapComponentRef}
					yaMapComponentRef={props.yaMapComponentRef}
					rnMapUserLocationMarkerRef={props.rnMapUserLocationMarkerRef}
					yaMapUserLocationMarkerRef={props.yaMapUserLocationMarkerRef}
					needSaveCenter
					latestUserMarkerLocationRef={props.latestUserMarkerLocationRef}
					initialMarkerLocation={props.initialMarkerLocation}
					maxContainerHeight={WINDOW_HEIGHT}
					// maxContainerHeight={WINDOW_HEIGHT}
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
					<MapActionButton onPress={toggleWorkoutTypeSheet}>
						{props.chosenWorkout && renderIcon(props.chosenWorkout.IconComponent, '#fff')}
					</MapActionButton>
					<StartButton onPress={() => props.handleClickStart(false)}>{t('WorkoutPage.start')}</StartButton>
					<MapActionButton onPress={() => router.navigate('/find-people')} className="hidden">
						<PeopleAddSvg />
					</MapActionButton>
					<View pointerEvents="none" className="w-[58px] h-[58px]" />
				</View>
				<AllGeolocationPermissions
					ref={props.permissionsRef}
					allPermissionsGrantedCallback={props.allPermsGranted}
				/>
				<BottomSheet ref={bottomSheetRef} blurDisabled={!isIOS} detents={[0.5, 1]} scrollable>
					{bottomSheetContent === BottomSheetContent.unsavedTrainings && (
						<UnsavedTrainings
							unsavedTrainingsCount={notSavedWorkoutsCount}
							isSaving={Boolean(syncingIds.length)}
							handleClickSave={saveUnsavedTrainings}
							handleClickDelete={deleteUnsavedWorkouts}
							handleClickDetails={handleClickDetails}
							handleClickClose={closeBottomSheet}
						/>
					)}
					{bottomSheetContent === BottomSheetContent.notFinishedWorkout && (
						<NotFinishedWorkout
							restoreAndContinue={handleRestoreAndContinueNotFinishedWorkout}
							deleteNotFinishedWorkout={handleDeleteNotFinishedWorkout}
							close={closeBottomSheet}
						/>
					)}

					{bottomSheetContent === BottomSheetContent.workouts && (
						<Container className="flex-1">
							<FlashList
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
					{bottomSheetContent === BottomSheetContent.unsavedDetails && (
						<UnsavedTrainingsDetails
							syncingIds={syncingIds}
							notSavedWorkouts={notSavedWorkouts}
							handleClickSaveOneWorkout={handleClickSaveOneWorkout}
							handleClickDelete={handleClickDeleteWorkout}
							handleClickDeleteAll={deleteUnsavedWorkouts}
						/>
					)}
				</BottomSheet>
			</>
		)
	})
)

NewWorkout.displayName = 'NewWorkout'

export default NewWorkout
