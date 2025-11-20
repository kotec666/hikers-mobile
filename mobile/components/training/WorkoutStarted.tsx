import React, { useCallback, useMemo, useState } from 'react'
import EndTrainingModal from '@/components/training/EndTrainingModal'
import { Container } from '@/components/ui/Container'
import { Dimensions, Text, View } from 'react-native'
import { fontFamily } from '@/constants/Fonts'
import MapComponent, { MapComponentHandle } from '@/components/map/MapComponent'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { IWorkoutLocationStorageItem } from '@/store/workoutStorage'
import { TrainingType } from '@shared/enums'
import MetricsTab from '@/components/training/tabs/MetricsTab'
import ShowMembersList from '@/components/training/tabs/ShowMembersList'
import InteractiveBottomElements from '@/components/training/InteractiveBottomElements'
import { MetricSpeedHandle } from '@/components/training/tabs/metrics/MetricSpeed'
import { UserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/UserLocationMarker'
import { Point } from 'react-native-yamap-plus'

interface IProps {
	// headingDebug: number | null
	initialMarkerLocation?: Point | null
	userLocations: React.RefObject<IWorkoutLocationStorageItem[]>
	isPaused: boolean
	handleClickPause: () => void
	handleClickEndWorkout: () => void
	workoutType: TrainingType
	mapComponentRef: React.RefObject<MapComponentHandle | null>
	metricSpeedRef: React.RefObject<MetricSpeedHandle | null>
	userLocationMarkerRef: React.RefObject<UserLocationMarkerHandle | null>
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

	console.log('render WorkoutStarted')
	return (
		<>
			<EndTrainingModal
				open={isEndTrainingModalOpen}
				handleClose={handleCloseEndModal}
				handleClickEnd={handleClickEnd}
			/>
			{/*<CompassDebug heading={props.headingDebug || 0} position="bottom-right" />*/}
			<Container>
				<Text className="my-[20px] text-white text-[20px]" style={{ fontFamily: fontFamily.bold }}>
					Тренировка
				</Text>
			</Container>
			<MapComponent
				ref={props.mapComponentRef}
				userLocationMarkerRef={props.userLocationMarkerRef}
				maxContainerHeight={mapViewHidden ? maxMapHeight : 0}
				maxMapHeight={mapViewHidden ? maxMapHeight : 0}
				initialMarkerLocation={props.initialMarkerLocation}
				initialLocations={props.userLocations}
			/>
			<Container style={{ paddingBottom: insets.bottom + 35 }} className="flex-1 w-full pt-[16px]">
				<View className="flex-1 justify-between gap-[16px]">
					{peopleListHidden ? (
						<MetricsTab
							mapViewHidden={mapViewHidden}
							workoutType={props.workoutType}
							isPaused={props.isPaused}
							userLocations={props.userLocations}
							metricSpeedRef={props.metricSpeedRef}
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
