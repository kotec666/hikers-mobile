import React from 'react'
import RNMapWorkout, { IRNMapWorkoutProps, RNMapWorkoutHandle } from '@/components/map/RNMapWorkout'
import YaMapWorkout, { IYaMapWorkoutProps, YaMapWorkoutHandle } from '@/components/map/YaMapWorkout'
import { Platform } from 'react-native'
import { RNMapsUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/RNMapsUserLocationMarker'
import { YaMapUserLocationMarkerHandle } from '@/components/map/markers/UserLocationMarker/YaMapUserLocationMarker'

type WorkoutMapProps = IRNMapWorkoutProps &
	Partial<IYaMapWorkoutProps> & {
		yaMapComponentRef?: React.RefObject<YaMapWorkoutHandle | null>
		rnMapComponentRef?: React.RefObject<RNMapWorkoutHandle | null>
		rnMapUserLocationMarkerRef?: React.RefObject<RNMapsUserLocationMarkerHandle | null>
		yaMapUserLocationMarkerRef?: React.RefObject<YaMapUserLocationMarkerHandle | null>
	}

const WorkoutMap = (props: WorkoutMapProps) => {
	const isIOS = Platform.OS === 'ios'
	const {
		rnMapComponentRef,
		yaMapComponentRef,
		rnMapUserLocationMarkerRef,
		yaMapUserLocationMarkerRef,

		appleLogoPosition,
		appleLegalPosition,

		logoPosition,
		logoPadding,

		...commonProps
	} = props

	if (isIOS) {
		return (
			<RNMapWorkout
				ref={rnMapComponentRef}
				userLocationMarkerRef={rnMapUserLocationMarkerRef}
				appleLogoPosition={appleLogoPosition}
				appleLegalPosition={appleLegalPosition}
				{...commonProps}
			/>
		)
	}

	return (
		<YaMapWorkout
			ref={yaMapComponentRef}
			userLocationMarkerRef={yaMapUserLocationMarkerRef}
			logoPosition={logoPosition}
			logoPadding={logoPadding}
			{...commonProps}
		/>
	)
}

export default WorkoutMap
