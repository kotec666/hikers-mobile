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
import { getNotSavedWorkouts, getWorkoutMeta } from '@/store/workoutStorage'
import * as Network from 'expo-network'

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
	const router = useRouter()
	const insets = useSafeAreaInsets()
	const bottomSheetRef = useRef<BottomSheetHandle>(null)
	const unsavedWorkoutsShownRef = useRef<boolean>(false)
	const networkState = Network.useNetworkState()
	const hasInternet = networkState.isInternetReachable === true

	const openBottomSheet = useCallback(() => {
		if (bottomSheetRef.current) {
			bottomSheetRef.current.openSheet()
		}
	}, [])

	useEffect(() => {
		if (unsavedWorkoutsShownRef.current || !hasInternet) return

		const meta = getWorkoutMeta()
		if (meta) return

		const notSavedWorkouts = getNotSavedWorkouts()

		if (notSavedWorkouts.length === 0) return
		openBottomSheet()
		unsavedWorkoutsShownRef.current = true
	}, [hasInternet, openBottomSheet])

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
					handleClickClose={closeBottomSheet}
					handleClickDelete={() => {}}
					handleClickSave={() => {}}
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
