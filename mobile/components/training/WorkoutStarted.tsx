import React, { RefObject, useCallback, useMemo, useState } from 'react'
import EndTrainingModal from '@/components/training/EndTrainingModal'
import { Container } from '@/components/ui/Container'
import { Dimensions, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { TrainingType } from '@shared/enums'
import MetricsTab from '@/components/training/tabs/MetricsTab'
import ShowMembersList from '@/components/training/tabs/ShowMembersList'
import InteractiveBottomElements from '@/components/training/InteractiveBottomElements'
import { MetricSpeedHandle } from '@/components/training/tabs/metrics/MetricSpeed'
import { UserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/UserLocationMarker'
import { Point } from 'react-native-yamap-plus'
import { MetricDistanceHandle } from '@/components/training/tabs/metrics/MetricDistance'
import { MetricCaloriesHandle } from '@/components/training/tabs/metrics/MetricCalories'
import { MetricHeightHandle } from '@/components/training/tabs/metrics/MetricHeight'
import MapComponentSegments, { MapComponentSegmentsHandle } from '@/components/map/MapComponentSegments'

interface IProps {
	// headingDebug: number | null
	// accuracyDebug: number | null
	// altitudeDebug: number | null
	// altitudeAccuracyDebug: number | null
	initialMarkerLocation?: Point | null
	latestUserMarkerLocationRef?: RefObject<Point | null>
	initialLocationsState: IWorkoutLocationStorageItem[]

	isPaused: boolean
	handleClickPause: () => void
	handleClickEndWorkout: () => void
	workoutType: TrainingType

	mapComponentRef: React.RefObject<MapComponentSegmentsHandle | null>
	userLocationMarkerRef: React.RefObject<UserLocationMarkerHandle | null>

	metricSpeedRef: React.RefObject<MetricSpeedHandle | null>
	metricDistanceRef: React.RefObject<MetricDistanceHandle | null>
	metricCaloriesRef: React.RefObject<MetricCaloriesHandle | null>
	metricHeightRef: React.RefObject<MetricHeightHandle | null>
	accumulatedDistanceRef: React.RefObject<number>
}

const { height } = Dimensions.get('screen')

const WorkoutStarted = (props: IProps) => {
	const insets = useSafeAreaInsets()
	const maxMapHeight = useMemo(() => height / 2 - 40 - insets.top, [insets.top])
	const [isEndTrainingModalOpen, setIsEndTrainingModalOpen] = useState(false)
	const [peopleListHidden, setPeopleListHidden] = useState(true)
	const [mapViewHidden, setMapViewHidden] = useState(true)

	const handleCloseEndModal = useCallback(() => {
		setIsEndTrainingModalOpen(false)
	}, [])

	const handleClickOpenEndModal = useCallback(() => {
		setIsEndTrainingModalOpen(true)
	}, [])

	const handleClickPeopleList = useCallback(() => {
		setPeopleListHidden((prevState) => !prevState)
		setMapViewHidden(true)
	}, [])

	const handleClickSwitchViewMode = useCallback(() => {
		setPeopleListHidden(true)
		setMapViewHidden((prevState) => !prevState)
	}, [])

	const handleClickEnd = useCallback(() => {
		handleCloseEndModal()
		props.handleClickEndWorkout()
	}, [])

	return (
		<>
			<EndTrainingModal
				open={isEndTrainingModalOpen}
				handleClose={handleCloseEndModal}
				handleClickEnd={handleClickEnd}
			/>
			{/*<CompassDebug*/}
			{/*	heading={props.headingDebug || 0}*/}
			{/*	accuracy={props.accuracyDebug || 0}*/}
			{/*	altitude={props.altitudeDebug || 0}*/}
			{/*	altitudeAccuracy={props.altitudeAccuracyDebug || 0}*/}
			{/*	position="bottom-right"*/}
			{/*/>*/}
			<Container>
				<Text className="my-[20px] text-white text-[20px]" style={{ fontFamily: fontFamily.bold }}>
					Тренировка
				</Text>
			</Container>
			<MapComponentSegments
				ref={props.mapComponentRef}
				userLocationMarkerRef={props.userLocationMarkerRef}
				latestUserMarkerLocationRef={props.latestUserMarkerLocationRef}
				initialMarkerLocation={props.initialMarkerLocation}
				initialLocations={props.initialLocationsState}
				maxContainerHeight={mapViewHidden ? maxMapHeight : 0}
				maxMapHeight={mapViewHidden ? maxMapHeight : 0}
			/>
			<Container style={{ paddingBottom: insets.bottom + 35 }} className="flex-1 w-full pt-[16px]">
				<View className="flex-1 justify-between gap-[16px]">
					{peopleListHidden ? (
						<MetricsTab
							mapViewHidden={mapViewHidden}
							workoutType={props.workoutType}
							isPaused={props.isPaused}
							metricSpeedRef={props.metricSpeedRef}
							metricDistanceRef={props.metricDistanceRef}
							metricCaloriesRef={props.metricCaloriesRef}
							metricHeightRef={props.metricHeightRef}
							accumulatedDistanceRef={props.accumulatedDistanceRef}
						/>
					) : (
						mapViewHidden && <ShowMembersList />
					)}
					<InteractiveBottomElements
						isPaused={props.isPaused}
						mapViewHidden={mapViewHidden}
						peopleListHidden={peopleListHidden}
						handleClickSwitchViewMode={handleClickSwitchViewMode}
						handleClickPeopleList={handleClickPeopleList}
						handleClickPause={props.handleClickPause}
						handleClickOpenEndModal={handleClickOpenEndModal}
					/>
				</View>
			</Container>
		</>
	)
}

export default React.memo(WorkoutStarted)
