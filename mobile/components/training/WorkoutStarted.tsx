import React, { RefObject, useCallback, useMemo, useState } from 'react'
import { Container } from '@/components/ui/Container'
import { Dimensions, Platform, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { TrainingType } from '@shared/enums'
import MetricsTab from '@/components/training/tabs/MetricsTab'
import ShowMembersList from '@/components/training/tabs/ShowMembersList'
import InteractiveBottomElements from '@/components/training/InteractiveBottomElements'
import { MetricSpeedHandle } from '@/components/training/tabs/metrics/MetricSpeed'
import { Point } from 'react-native-yamap-plus'
import { MetricDistanceHandle } from '@/components/training/tabs/metrics/MetricDistance'
import { MetricCaloriesHandle } from '@/components/training/tabs/metrics/MetricCalories'
import { MetricHeightHandle } from '@/components/training/tabs/metrics/MetricHeight'
import { MetricAvgSpeedHandle } from '@/components/training/tabs/metrics/MetricAvgSpeed'
import YaMapWorkout, { YaMapWorkoutHandle } from '@/components/map/YaMapWorkout'
import { YaMapUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'
import RNMapWorkout, { RNMapWorkoutHandle } from '@/components/map/RNMapWorkout'
import { RNMapsUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'

interface IProps {
	initialMarkerLocation?: Point | null
	latestUserMarkerLocationRef?: RefObject<Point | null>
	initialLocationsState: IWorkoutLocationStorageItem[]

	isPaused: boolean
	handleClickPause: () => void
	handleClickOpenEndModal: () => void
	workoutType: TrainingType

	yaMapComponentRef: React.RefObject<YaMapWorkoutHandle | null>
	yaMapUserLocationMarkerRef: React.RefObject<YaMapUserLocationMarkerHandle | null>

	rnMapComponentRef: React.RefObject<RNMapWorkoutHandle | null>
	rnMapUserLocationMarkerRef: React.RefObject<RNMapsUserLocationMarkerHandle | null>

	metricAvgSpeedRef: React.RefObject<MetricAvgSpeedHandle | null>
	metricSpeedRef: React.RefObject<MetricSpeedHandle | null>
	metricDistanceRef: React.RefObject<MetricDistanceHandle | null>
	metricCaloriesRef: React.RefObject<MetricCaloriesHandle | null>
	metricHeightRef: React.RefObject<MetricHeightHandle | null>
	accumulatedDistanceRef: React.RefObject<number>
}

const { height } = Dimensions.get('screen')

const WorkoutStarted = (props: IProps) => {
	const insets = useSafeAreaInsets()
	const isIOS = Platform.OS === 'ios'
	const maxMapHeight = useMemo(() => height / 2 - 40 - insets.top, [insets.top])
	const [peopleListHidden, setPeopleListHidden] = useState(true)
	const [mapViewHidden, setMapViewHidden] = useState(true)

	const handleClickPeopleList = useCallback(() => {
		setPeopleListHidden((prevState) => !prevState)
		setMapViewHidden(true)
	}, [])

	const handleClickSwitchViewMode = useCallback(() => {
		setPeopleListHidden(true)
		setMapViewHidden((prevState) => !prevState)
	}, [])

	return (
		<>
			<Container>
				<Text className="mb-[20px] text-white text-[20px]" style={{ fontFamily: fontFamily.bold }}>
					Тренировка
				</Text>
			</Container>
			{isIOS ? (
				<RNMapWorkout
					ref={props.rnMapComponentRef}
					needSaveCenter
					userLocationMarkerRef={props.rnMapUserLocationMarkerRef}
					latestUserMarkerLocationRef={props.latestUserMarkerLocationRef}
					initialMarkerLocation={props.initialMarkerLocation}
					initialLocations={props.initialLocationsState}
					maxContainerHeight={mapViewHidden ? maxMapHeight : 0}
				/>
			) : (
				<YaMapWorkout
					ref={props.yaMapComponentRef}
					needSaveCenter
					userLocationMarkerRef={props.yaMapUserLocationMarkerRef}
					latestUserMarkerLocationRef={props.latestUserMarkerLocationRef}
					initialMarkerLocation={props.initialMarkerLocation}
					initialLocations={props.initialLocationsState}
					maxContainerHeight={mapViewHidden ? maxMapHeight : 0}
				/>
			)}

			<Container style={{ paddingBottom: insets.bottom + 35 }} className="flex-1 w-full pt-[16px]">
				<View className="flex-1 justify-between gap-[16px]">
					{peopleListHidden ? (
						<MetricsTab
							mapViewHidden={mapViewHidden}
							workoutType={props.workoutType}
							isPaused={props.isPaused}
							metricAvgSpeedRef={props.metricAvgSpeedRef}
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
						handleClickOpenEndModal={props.handleClickOpenEndModal}
					/>
				</View>
			</Container>
		</>
	)
}

export default React.memo(WorkoutStarted)
